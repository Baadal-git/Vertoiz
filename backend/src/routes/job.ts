import { Router } from "express";
import { type Job, type Queue } from "bullmq";
import { z } from "zod";
import { fixQueue, scanQueue, type ScanJobData } from "../queues";
import { getUserId, requireAuth } from "../middleware/auth";

export const jobRouter = Router();

const ScanJobSchema = z.object({
  repoUrl: z.string().min(1).max(2048),
  userId: z.string().min(1),
  scanId: z.string().min(1),
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
  const data = parsed.data;

  if (data.userId !== authenticatedUserId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const job = await scanQueue.add("scan", data);

    res.status(202).json({
      jobId: job.id,
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
