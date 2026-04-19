import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { promises as fs } from "fs";
import { Worker } from "bullmq";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import {
  createRedisConnection,
  SCAN_QUEUE_NAME,
  type ScanJobData,
} from "../queues";
import { db } from "../db";
import {
  blueprints,
  scalingPlans,
  scans,
  violations,
} from "../db/schema";
import { analyzeCodebase, type AnalysisResult } from "../services/analysis";
import type { CodebaseFile, ScanContext, SensitivePattern } from "../lib/types";

const execAsync = promisify(exec);
const JOB_ROOT = "/tmp/vertoiz-jobs";
const SKIPPED_DIRECTORIES = new Set(["node_modules", ".git", "dist", "build"]);
const MAX_FILE_BYTES = 250_000;

export function startScanWorker(): Worker<ScanJobData> {
  const worker = new Worker<ScanJobData>(
    SCAN_QUEUE_NAME,
    async (job) => {
      const { scanId } = job.data;
      const tempDir = path.join(JOB_ROOT, scanId);

      try {
        await updateScanStatus(scanId, "scanning");

        await cloneRepository(job.data, tempDir);
        await job.updateProgress(10);

        const files = await readRepositoryFiles(tempDir);
        await job.updateProgress(25);

        await updateScanStatus(scanId, "analyzing", files.length);
        const context = buildScanContext(job.data.repoUrl, files);
        const result = await analyzeCodebase(context);
        await job.updateProgress(75);

        await saveAnalysisResult(scanId, result, files.length);
        await job.updateProgress(90);

        await cleanupTempDirectory(tempDir);
        await job.updateProgress(100);

        return {
          scanId,
          violationCount: result.violations.length,
        };
      } catch (err) {
        const message = sanitizeErrorMessage(err, job.data.githubToken);
        await markScanFailed(scanId, message);
        await cleanupTempDirectory(tempDir);
        throw new Error(message);
      }
    },
    {
      connection: createRedisConnection(),
    }
  );

  worker.on("completed", (job) => {
    console.log("Scan job completed:", job.id);
  });

  worker.on("failed", (job, err) => {
    console.error("Scan job failed:", job?.id, err);
  });

  worker.on("error", (err) => {
    console.error("Scan worker error:", err);
  });

  return worker;
}

async function cloneRepository(
  data: ScanJobData,
  tempDir: string
): Promise<void> {
  const repoFullName = parseGitHubRepoFullName(data.repoUrl);
  const encodedToken = encodeURIComponent(data.githubToken);
  const cloneUrl = `https://x-access-token:${encodedToken}@github.com/${repoFullName}.git`;
  const command = `git clone ${quoteShellArg(cloneUrl)} ${quoteShellArg(tempDir)}`;

  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(tempDir), { recursive: true });

  try {
    await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
    });
  } catch (err) {
    throw new Error(`Git clone failed: ${sanitizeErrorMessage(err, data.githubToken)}`);
  }
}

async function readRepositoryFiles(rootDir: string): Promise<CodebaseFile[]> {
  const files: CodebaseFile[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) {
          await walk(absolutePath);
        }
        continue;
      }

      if (!entry.isFile() || shouldSkipFile(entry.name)) {
        continue;
      }

      const stat = await fs.stat(absolutePath);
      if (stat.size > MAX_FILE_BYTES) {
        continue;
      }

      const content = await fs.readFile(absolutePath, "utf8").catch(() => null);
      if (content === null || content.includes("\u0000")) {
        continue;
      }

      files.push({
        path: toRepoPath(path.relative(rootDir, absolutePath)),
        content,
      });
    }
  }

  await walk(rootDir);
  return files;
}

function buildScanContext(projectName: string, files: CodebaseFile[]): ScanContext {
  const packageJson = readPackageJson(files);
  const dependencyNames = Object.keys(packageJson);
  const fileTree = files.map((file) => file.path).sort();

  return {
    projectName,
    files,
    fileTree,
    importGraph: buildImportGraph(files),
    detectedPatterns: {
      hasExpressRoutes: dependencyNames.includes("express") || includesAny(files, ["express()"]),
      hasFastifyRoutes: dependencyNames.includes("fastify") || includesAny(files, ["fastify("]),
      hasNextJs: dependencyNames.includes("next") || fileTree.some((file) => file.startsWith("app/")),
      hasNestJs: dependencyNames.includes("@nestjs/core"),
      hasPrisma: dependencyNames.includes("@prisma/client") || fileTree.some((file) => file.includes("prisma/")),
      hasMongoose: dependencyNames.includes("mongoose"),
      hasDrizzle: dependencyNames.includes("drizzle-orm"),
      hasRedis: dependencyNames.includes("redis") || dependencyNames.includes("ioredis"),
      hasJWT: dependencyNames.includes("jsonwebtoken") || includesAny(files, ["jwt.sign", "jwt.verify"]),
      hasPassport: dependencyNames.includes("passport"),
      hasBullQueue: dependencyNames.includes("bullmq") || dependencyNames.includes("bull"),
      hasDockerfile: fileTree.some((file) => path.basename(file).toLowerCase() === "dockerfile"),
      hasWebSockets: dependencyNames.includes("ws") || dependencyNames.includes("socket.io"),
      hasTRPC: dependencyNames.some((name) => name.includes("trpc")),
      hasSupabase: dependencyNames.includes("@supabase/supabase-js"),
      hasFirebase: dependencyNames.includes("firebase") || dependencyNames.includes("firebase-admin"),
      packageJson,
    },
    routeFiles: fileTree.filter(isRouteFile),
    modelFiles: fileTree.filter(isModelFile),
    configFiles: fileTree.filter(isConfigFile),
    entryPoints: fileTree.filter(isEntryPoint),
    routeHandlers: extractRouteHandlers(files),
    envFileKeys: extractEnvKeys(files),
    sensitivePatterns: extractSensitivePatterns(files),
    totalFiles: files.length,
  };
}

async function saveAnalysisResult(
  scanId: string,
  result: AnalysisResult,
  totalFiles: number
): Promise<void> {
  const [scan] = await db
    .select()
    .from(scans)
    .where(eq(scans.id, scanId))
    .limit(1);

  if (!scan) {
    throw new Error(`Scan ${scanId} not found`);
  }

  await db.delete(violations).where(eq(violations.scanId, scanId));
  await db.delete(blueprints).where(eq(blueprints.scanId, scanId));
  await db.delete(scalingPlans).where(eq(scalingPlans.scanId, scanId));

  await db.insert(blueprints).values({
    id: uuid(),
    scanId,
    architectureSummary: result.architectureSummary,
    securitySummary: result.securitySummary,
    scalingSummary: result.scalingSummary,
    proposedStructure: result.proposedFileStructure,
    mermaidDiagram: result.mermaidDiagram,
    rawBlueprint: result as unknown as Record<string, unknown>,
    createdAt: new Date(),
  });

  if (result.violations.length > 0) {
    await db.insert(violations).values(
      result.violations.map((violation) => ({
        id: uuid(),
        scanId,
        projectId: scan.projectId,
        category: violation.category,
        severity: violation.severity,
        status: "open" as const,
        title: violation.title,
        description: violation.description,
        location: violation.location || null,
        currentCode: violation.currentCode || null,
        fixDescription: violation.fixDescription,
        fixCode: violation.fixCode || null,
        createdAt: new Date(),
      }))
    );
  }

  await db.insert(scalingPlans).values({
    id: uuid(),
    scanId,
    currentBottlenecks: result.scalingPlan.currentBottlenecks,
    plan100Users: result.scalingPlan.plan100Users,
    plan10kUsers: result.scalingPlan.plan10kUsers,
    plan100kUsers: result.scalingPlan.plan100kUsers,
    createdAt: new Date(),
  });

  await db
    .update(scans)
    .set({
      status: "complete",
      totalFiles,
      completedAt: new Date(),
      errorMessage: null,
    })
    .where(eq(scans.id, scanId));
}

async function updateScanStatus(
  scanId: string,
  status: "scanning" | "analyzing",
  totalFiles?: number
): Promise<void> {
  await db
    .update(scans)
    .set({
      status,
      ...(typeof totalFiles === "number" ? { totalFiles } : {}),
    })
    .where(eq(scans.id, scanId));
}

async function markScanFailed(scanId: string, errorMessage: string): Promise<void> {
  await db
    .update(scans)
    .set({
      status: "failed",
      errorMessage,
    })
    .where(eq(scans.id, scanId));
}

async function cleanupTempDirectory(tempDir: string): Promise<void> {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to clean up scan temp directory:", {
      tempDir,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

function readPackageJson(files: CodebaseFile[]): Record<string, string> {
  const packageFile = files.find((file) => file.path === "package.json");
  if (!packageFile) {
    return {};
  }

  try {
    const parsed = JSON.parse(packageFile.content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    return {
      ...(parsed.dependencies ?? {}),
      ...(parsed.devDependencies ?? {}),
    };
  } catch {
    return {};
  }
}

function buildImportGraph(files: CodebaseFile[]): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  const importRegex = /(?:import\s+.*?\s+from\s+["']([^"']+)["']|require\(["']([^"']+)["']\))/g;

  for (const file of files) {
    const imports: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(file.content)) !== null) {
      imports.push(match[1] ?? match[2]);
    }

    if (imports.length > 0) {
      graph[file.path] = imports.slice(0, 50);
    }
  }

  return graph;
}

function extractRouteHandlers(files: CodebaseFile[]): string[] {
  const handlers: string[] = [];
  const expressRegex = /\b(?:app|router)\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/gi;
  const nextRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g;

  for (const file of files) {
    let match: RegExpExecArray | null;

    while ((match = expressRegex.exec(file.content)) !== null) {
      handlers.push(`${match[1].toUpperCase()} ${match[2]} (${file.path})`);
    }

    while ((match = nextRegex.exec(file.content)) !== null) {
      handlers.push(`${match[1].toUpperCase()} ${file.path}`);
    }
  }

  return handlers.slice(0, 100);
}

function extractEnvKeys(files: CodebaseFile[]): string[] {
  const envFiles = files.filter((file) =>
    [".env.example", ".env.sample"].includes(path.basename(file.path))
  );
  const keys = new Set<string>();

  for (const file of envFiles) {
    for (const line of file.content.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=/);
      if (match) {
        keys.add(match[1]);
      }
    }
  }

  return [...keys];
}

function extractSensitivePatterns(files: CodebaseFile[]): SensitivePattern[] {
  const patterns = [
    { label: "hardcoded API key", regex: /api[_-]?key\s*[:=]\s*["'][^"']{16,}/i },
    { label: "hardcoded secret", regex: /secret\s*[:=]\s*["'][^"']{16,}/i },
    { label: "private key material", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
    { label: "access token literal", regex: /token\s*[:=]\s*["'][A-Za-z0-9_\-.]{24,}/i },
  ];
  const findings: SensitivePattern[] = [];

  for (const file of files) {
    for (const pattern of patterns) {
      if (pattern.regex.test(file.content)) {
        findings.push({ file: file.path, pattern: pattern.label });
      }
    }
  }

  return findings.slice(0, 100);
}

function includesAny(files: CodebaseFile[], needles: string[]): boolean {
  return files.some((file) => needles.some((needle) => file.content.includes(needle)));
}

function isRouteFile(filePath: string): boolean {
  return (
    filePath.includes("/routes/") ||
    filePath.includes("/api/") ||
    filePath.endsWith("route.ts") ||
    filePath.endsWith("route.tsx") ||
    filePath.includes("pages/api/")
  );
}

function isModelFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return (
    lower.includes("schema") ||
    lower.includes("model") ||
    lower.includes("entity") ||
    lower.includes("prisma/")
  );
}

function isConfigFile(filePath: string): boolean {
  const baseName = path.basename(filePath).toLowerCase();
  return (
    baseName.includes("config") ||
    baseName === "package.json" ||
    baseName === "dockerfile" ||
    baseName === "tsconfig.json"
  );
}

function isEntryPoint(filePath: string): boolean {
  const normalized = filePath.toLowerCase();
  return [
    "src/index.ts",
    "src/index.js",
    "src/server.ts",
    "src/server.js",
    "src/main.ts",
    "src/main.js",
    "index.ts",
    "index.js",
    "server.ts",
    "server.js",
  ].includes(normalized);
}

function shouldSkipFile(fileName: string): boolean {
  return fileName === ".env" || fileName.startsWith(".env.");
}

function toRepoPath(value: string): string {
  return value.split(path.sep).join("/");
}

function parseGitHubRepoFullName(repoIdentifier: string): string {
  const trimmed = repoIdentifier.trim();
  const directMatch = trimmed.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/);

  if (directMatch) {
    return directMatch[1];
  }

  const url = new URL(trimmed);
  const fullName = url.pathname.replace(/^\/+/, "").replace(/\.git$/, "");

  if (url.hostname !== "github.com" || !/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/.test(fullName)) {
    throw new Error("Invalid GitHub repository URL");
  }

  return fullName;
}

function quoteShellArg(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function sanitizeErrorMessage(err: unknown, githubToken: string): string {
  const message = err instanceof Error ? err.message : String(err);
  const encodedToken = encodeURIComponent(githubToken);

  return message
    .split(githubToken)
    .join("[redacted]")
    .split(encodedToken)
    .join("[redacted]");
}
