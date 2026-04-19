import { Worker } from "bullmq";
import {
  createRedisConnection,
  FIX_QUEUE_NAME,
  type FixJobData,
} from "../queues";

export function startFixWorker(): Worker<FixJobData> {
  const worker = new Worker<FixJobData>(
    FIX_QUEUE_NAME,
    async (job) => {
      console.log("Processing fix job:", job.id, job.data);
      await job.updateProgress(100);

      return {
        completed: true,
      };
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
