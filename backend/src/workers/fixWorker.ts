import Anthropic from "@anthropic-ai/sdk";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { and, eq, inArray } from "drizzle-orm";
import { Worker } from "bullmq";
import { db } from "../db";
import { scans, violations } from "../db/schema";
import {
  createRedisConnection,
  FIX_QUEUE_NAME,
  type FixJobData,
} from "../queues";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const execAsync = promisify(exec);
const JOB_ROOT = "/tmp/vertoiz-jobs";
const FIX_SYSTEM_PROMPT =
  'You are an expert software architect. Apply the specified architectural fixes to the provided codebase files. Return ONLY a valid JSON object with shape { files: Array<{ path: string, content: string }> } containing the complete corrected content of every file that needs to change. Do not change anything unrelated to the listed violations. Do not include markdown, explanation, or backticks.';
const importOctokitRest = new Function(
  'return import("@octokit/rest")'
) as () => Promise<{ Octokit: typeof import("@octokit/rest")["Octokit"] }>;

type FixableViolation = {
  id: string;
  category: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  location: string | null;
  fixDescription: string;
};

type ClaudeFixResponse = {
  files: Array<{
    path: string;
    content: string;
  }>;
};

type TestResult =
  | { ran: false }
  | { ran: true; passed: boolean; output: string };

export function startFixWorker(): Worker<FixJobData> {
  const worker = new Worker<FixJobData>(
    FIX_QUEUE_NAME,
    async (job) => {
      const repoDir = path.join(JOB_ROOT, job.data.scanId);

      try {
        const fixableViolations = await loadFixableViolations(job.data.scanId);
        await job.updateProgress(5);

        if (fixableViolations.length === 0) {
          throw new Error("No fixable violations found for this scan.");
        }

        await ensureRepository(job.data, repoDir);
        await job.updateProgress(15);

        const affectedFiles = await collectAffectedFiles(repoDir, fixableViolations);
        const fixedFiles = await requestFixedFiles(
          fixableViolations,
          affectedFiles
        );
        await job.updateProgress(45);

        await writeFixedFiles(repoDir, fixedFiles);
        await job.updateProgress(55);

        const testResult = await runDetectedTests(repoDir);
        await job.updateProgress(75);

        const branchName = `vertoiz/fixes-${job.data.scanId}`;
        await commitAndPushChanges(
          repoDir,
          branchName,
          fixableViolations.length
        );
        await job.updateProgress(85);

        const prUrl = await createPullRequest(
          job.data,
          branchName,
          fixableViolations,
          testResult
        );
        await job.updateProgress(95);

        await db
          .update(scans)
          .set({
            fixPrUrl: prUrl,
          })
          .where(eq(scans.id, job.data.scanId));

        await cleanupTempDirectory(repoDir);
        await job.updateProgress(100);

        return { prUrl };
      } catch (err) {
        const message = sanitizeErrorMessage(err, job.data.githubToken);
        await cleanupTempDirectory(repoDir);
        throw new Error(message);
      }
    },
    {
      connection: createRedisConnection(),
    }
  );

  worker.on("completed", (job) => {
    console.log("Fix job completed:", job.id);
  });

  worker.on("failed", (job, err) => {
    console.error("Fix job failed:", job?.id, err);
  });

  worker.on("error", (err) => {
    console.error("Fix worker error:", err);
  });

  return worker;
}

async function loadFixableViolations(scanId: string): Promise<FixableViolation[]> {
  return db
    .select({
      id: violations.id,
      category: violations.category,
      severity: violations.severity,
      status: violations.status,
      title: violations.title,
      description: violations.description,
      location: violations.location,
      fixDescription: violations.fixDescription,
    })
    .from(violations)
    .where(
      and(
        eq(violations.scanId, scanId),
        inArray(violations.status, ["open", "approved"])
      )
    );
}

async function ensureRepository(
  jobData: FixJobData,
  repoDir: string
): Promise<void> {
  const gitDir = path.join(repoDir, ".git");

  if (await pathExists(gitDir)) {
    return;
  }

  const encodedToken = encodeURIComponent(jobData.githubToken);
  const cloneUrl = `https://x-access-token:${encodedToken}@github.com/${jobData.repoFullName}.git`;
  const command = `git clone ${quoteShellArg(cloneUrl)} ${quoteShellArg(repoDir)}`;

  await fs.rm(repoDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(repoDir), { recursive: true });

  try {
    await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
    });
  } catch (err) {
    throw new Error(`Git clone failed: ${sanitizeErrorMessage(err, jobData.githubToken)}`);
  }
}

async function collectAffectedFiles(
  repoDir: string,
  fixableViolations: FixableViolation[]
): Promise<Array<{ path: string; content: string }>> {
  const filePaths = new Set<string>();

  for (const violation of fixableViolations) {
    const normalized = normalizeLocationToPath(violation.location);

    if (normalized) {
      filePaths.add(normalized);
    }
  }

  const files: Array<{ path: string; content: string }> = [];

  for (const relativePath of filePaths) {
    const absolutePath = path.resolve(repoDir, relativePath);

    if (!absolutePath.startsWith(path.resolve(repoDir))) {
      throw new Error(`Invalid file path returned by violation location: ${relativePath}`);
    }

    if (!(await pathExists(absolutePath))) {
      continue;
    }

    const content = await fs.readFile(absolutePath, "utf8");
    files.push({
      path: relativePath,
      content,
    });
  }

  if (files.length === 0) {
    throw new Error("No affected files were found for the selected violations.");
  }

  return files;
}

async function requestFixedFiles(
  fixableViolations: FixableViolation[],
  affectedFiles: Array<{ path: string; content: string }>
): Promise<Array<{ path: string; content: string }>> {
  const userMessage = [
    "VIOLATIONS:",
    JSON.stringify(fixableViolations, null, 2),
    "",
    "FILES:",
    affectedFiles
      .map(
        (file) => `--- ${file.path} ---\n${file.content}`
      )
      .join("\n\n"),
  ].join("\n");

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: FIX_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const raw = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("");

      return parseClaudeFixResponse(raw);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Claude did not return valid fix JSON.");
}

function parseClaudeFixResponse(
  raw: string
): Array<{ path: string; content: string }> {
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error("Claude returned malformed JSON for fix generation.");
  }

  const parsed = JSON.parse(
    raw.slice(jsonStart, jsonEnd + 1)
  ) as ClaudeFixResponse;

  if (!parsed.files || !Array.isArray(parsed.files)) {
    throw new Error("Claude fix response did not include a files array.");
  }

  return parsed.files;
}

async function writeFixedFiles(
  repoDir: string,
  files: Array<{ path: string; content: string }>
): Promise<void> {
  if (files.length === 0) {
    throw new Error("Claude did not return any files to update.");
  }

  for (const file of files) {
    const absolutePath = path.resolve(repoDir, file.path);

    if (!absolutePath.startsWith(path.resolve(repoDir))) {
      throw new Error(`Claude attempted to write outside the repo: ${file.path}`);
    }

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, file.content, "utf8");
  }
}

async function runDetectedTests(repoDir: string): Promise<TestResult> {
  const packageJsonPath = path.join(repoDir, "package.json");
  if (await pathExists(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8")
      ) as { scripts?: Record<string, string> };

      if (packageJson.scripts?.test) {
        return runCommandWithResult("CI=true npm test", repoDir);
      }
    } catch {
      // ignore invalid package.json and continue to other test runners
    }
  }

  if (
    (await pathExists(path.join(repoDir, "pytest.ini"))) ||
    (await findFileNamed(repoDir, "conftest.py"))
  ) {
    return runCommandWithResult("pytest", repoDir);
  }

  if (await pathExists(path.join(repoDir, "go.mod"))) {
    return runCommandWithResult("go test ./...", repoDir);
  }

  return { ran: false };
}

async function runCommandWithResult(
  command: string,
  cwd: string
): Promise<TestResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        CI: "true",
      },
    });

    return {
      ran: true,
      passed: true,
      output: [stdout, stderr].filter(Boolean).join("\n").trim(),
    };
  } catch (err) {
    const output = extractCommandOutput(err);

    return {
      ran: true,
      passed: false,
      output: output.trim(),
    };
  }
}

async function commitAndPushChanges(
  repoDir: string,
  branchName: string,
  violationCount: number
): Promise<void> {
  await execGit("git checkout -B " + quoteShellArg(branchName), repoDir);
  await execGit("git config user.name 'Vertoiz Bot'", repoDir);
  await execGit("git config user.email 'bot@vertoiz.com'", repoDir);
  const statusOutput = await execGitWithOutput("git status --porcelain", repoDir);

  if (!statusOutput.trim()) {
    throw new Error("Generated fixes did not change any files.");
  }

  await execGit("git add -A", repoDir);
  await execGit(
    `git commit -m ${quoteShellArg(
      `fix: Vertoiz architectural fixes (${violationCount} violations resolved)`
    )}`,
    repoDir
  );
  await execGit(`git push origin ${quoteShellArg(branchName)}`, repoDir);
}

async function createPullRequest(
  jobData: FixJobData,
  branchName: string,
  fixableViolations: FixableViolation[],
  testResult: TestResult
): Promise<string> {
  const { Octokit } = await importOctokitRest();
  const octokit = new Octokit({
    auth: jobData.githubToken,
  });
  const [owner, repo] = jobData.repoFullName.split("/");

  if (!owner || !repo) {
    throw new Error("Invalid GitHub repository name");
  }

  const response = await octokit.rest.pulls.create({
    owner,
    repo,
    title: "Vertoiz: Production-readiness fixes",
    body: buildPullRequestBody(fixableViolations, testResult),
    head: branchName,
    base: jobData.defaultBranch,
  });

  return response.data.html_url;
}

function buildPullRequestBody(
  fixableViolations: FixableViolation[],
  testResult: TestResult
): string {
  const grouped = new Map<string, FixableViolation[]>();

  for (const violation of fixableViolations) {
    const bucket = grouped.get(violation.category) ?? [];
    bucket.push(violation);
    grouped.set(violation.category, bucket);
  }

  const sections = [...grouped.entries()].map(([category, entries]) => {
    const items = entries
      .map(
        (violation) =>
          `- **${violation.title}**: ${violation.fixDescription} (${violation.location ?? "location unknown"})`
      )
      .join("\n");

    return `## ${category}\n${items}`;
  });

  const testSummary = !testResult.ran
    ? "## Test result\nNo automated test suite was detected.\n"
    : testResult.passed
      ? `## Test result\nTests passed.\n\n\`\`\`\n${truncateOutput(
          testResult.output
        )}\n\`\`\``
      : `## Test result\nTests failed. The PR was still created for review.\n\n\`\`\`\n${truncateOutput(
          testResult.output
        )}\n\`\`\``;

  return [
    "# Vertoiz automated fixes",
    "",
    "This PR was generated by Vertoiz to apply architectural and production-readiness fixes.",
    "",
    ...sections,
    "",
    testSummary,
  ].join("\n");
}

async function execGit(command: string, cwd: string): Promise<void> {
  await execGitWithOutput(command, cwd);
}

async function execGitWithOutput(command: string, cwd: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        CI: "true",
      },
    });
    return [stdout, stderr].filter(Boolean).join("\n");
  } catch (err) {
    throw new Error(extractCommandOutput(err));
  }
}

async function cleanupTempDirectory(tempDir: string): Promise<void> {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to clean up fix temp directory:", {
      tempDir,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

function normalizeLocationToPath(location: string | null): string | null {
  if (!location) {
    return null;
  }

  const trimmed = location.trim();
  const match = trimmed.match(/^(.*?)(?::\d+(?::\d+)?)?$/);
  const candidate = match?.[1]?.trim() ?? trimmed;

  return candidate.length > 0 ? candidate : null;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findFileNamed(rootDir: string, fileName: string): Promise<boolean> {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isFile() && entry.name === fileName) {
      return true;
    }

    if (entry.isDirectory() && ![".git", "node_modules", "dist", "build"].includes(entry.name)) {
      if (await findFileNamed(absolutePath, fileName)) {
        return true;
      }
    }
  }

  return false;
}

function extractCommandOutput(err: unknown): string {
  if (err && typeof err === "object") {
    const stdout = "stdout" in err ? String(err.stdout ?? "") : "";
    const stderr = "stderr" in err ? String(err.stderr ?? "") : "";
    const message = "message" in err ? String(err.message ?? "") : String(err);

    return [message, stdout, stderr].filter(Boolean).join("\n");
  }

  return String(err);
}

function truncateOutput(output: string): string {
  if (output.length <= 4000) {
    return output;
  }

  return `${output.slice(0, 4000)}\n...truncated...`;
}

function quoteShellArg(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function sanitizeErrorMessage(err: unknown, githubToken: string): string {
  const message = extractCommandOutput(err);
  const encodedToken = encodeURIComponent(githubToken);

  return message
    .split(githubToken)
    .join("[redacted]")
    .split(encodedToken)
    .join("[redacted]");
}
