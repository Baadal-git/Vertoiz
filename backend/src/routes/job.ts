import { Router } from "express";
import { type Job, type Queue } from "bullmq";
import { z } from "zod";
import { fixQueue, scanQueue, type ScanJobData } from "../queues";
import { getUserId, requireAuth } from "../middleware/auth";
import { getGitHubTokenForUser } from "../github/repos";
import { createScan, getOrCreateProject } from "../services/scan";

export const jobRouter = Router();

const ScanJobSchema = z.object({
  repoUrl: z.string().min(1).max(2048).optional(),
  repoFullName: z.string().min(1).max(300).optional(),
  fullName: z.string().min(1).max(300).optional(),
  defaultBranch: z.string().min(1).max(200).optional(),
  userId: z.string().min(1).optional(),
  scanId: z.string().min(1).optional(),
});

type QueueEntry = {
  name: "scan" | "fix";
  queue: Queue;
};

const queues: QueueEntry[] = [
  { name: "scan", queue: scanQueue as Queue },
  { name: "fix", queue: fixQueue as Queue },
];

jobRouter.post("/scan", requireAuth, async (req, res) => {
  const parsed = ScanJobSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten(),
    });
    return;
  }

  const authenticatedUserId = getUserId(req);
  const requestedUserId = parsed.data.userId;

  if (requestedUserId && requestedUserId !== authenticatedUserId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const repoUrl = getRepoIdentifier(parsed.data);
    const repoFullName = parseGitHubRepoFullName(repoUrl);
    const githubToken = await getGitHubTokenForUser(authenticatedUserId);
    const project = await getOrCreateProject(authenticatedUserId, repoFullName);
    const scan = await createScan(project.id, authenticatedUserId);
    const data: ScanJobData = {
      repoUrl: repoFullName,
      userId: authenticatedUserId,
      scanId: scan.id,
      githubToken,
      defaultBranch: parsed.data.defaultBranch,
    };
    const job = await scanQueue.add("scan", data, {
      attempts: 1,
    });

    res.status(202).json({
      jobId: job.id,
      scanId: scan.id,
    });
  } catch (err) {
    console.error("Scan job enqueue error:", err);
    res.status(500).json({ error: "Failed to enqueue scan job" });
  }
});

jobRouter.get("/:jobId/status", requireAuth, async (req, res) => {
  const authenticatedUserId = getUserId(req);
  const { jobId } = req.params;

  try {
    const found = await findJob(jobId);

    if (!found) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const jobUserId = getJobUserId(found.job);
    if (jobUserId && jobUserId !== authenticatedUserId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const status = await found.job.getState();

    res.json({
      jobId: found.job.id ?? jobId,
      status,
      progress: found.job.progress,
      result: found.job.returnvalue ?? null,
      failReason: found.job.failedReason ?? null,
    });
  } catch (err) {
    console.error("Job status error:", err);
    res.status(500).json({ error: "Failed to get job status" });
  }
});

async function findJob(
  jobId: string
): Promise<{ queueName: QueueEntry["name"]; job: Job } | null> {
  for (const entry of queues) {
    const job = await entry.queue.getJob(jobId);

    if (job) {
      return {
        queueName: entry.name,
        job,
      };
    }
  }

  return null;
}

function getJobUserId(job: Job): string | undefined {
  const data = job.data as Partial<ScanJobData>;

  return typeof data.userId === "string" ? data.userId : undefined;
}

function getRepoIdentifier(data: z.infer<typeof ScanJobSchema>): string {
  const repoIdentifier = data.repoFullName ?? data.fullName ?? data.repoUrl;

  if (!repoIdentifier) {
    throw new Error("repoUrl, repoFullName, or fullName is required");
  }

  return repoIdentifier;
}

function parseGitHubRepoFullName(repoIdentifier: string): string {
  const trimmed = repoIdentifier.trim();
  const directMatch = trimmed.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/);

  if (directMatch) {
    return directMatch[1];
  }

  const url = new URL(trimmed);

  if (url.hostname !== "github.com") {
    throw new Error("Only github.com repositories are supported");
  }

  const fullName = url.pathname.replace(/^\/+/, "").replace(/\.git$/, "");

  if (!/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/.test(fullName)) {
    throw new Error("Invalid GitHub repository name");
  }

  return fullName;
}
