import { Worker } from "bullmq";
import {
  createRedisConnection,
  SCAN_QUEUE_NAME,
  type ScanJobData,
} from "../queues";

export function startScanWorker(): Worker<ScanJobData> {
  const worker = new Worker<ScanJobData>(
    SCAN_QUEUE_NAME,
    async (job) => {
      console.log("Processing scan job:", job.id, job.data);
      await job.updateProgress(100);

      return {
        completed: true,
        scanId: job.data.scanId,
      };
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
