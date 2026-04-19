import { Queue } from "bullmq";
import IORedis, { type RedisOptions } from "ioredis";

export const SCAN_QUEUE_NAME = "scanQueue";
export const FIX_QUEUE_NAME = "fixQueue";

export type ScanJobData = {
  repoUrl: string;
  userId: string;
  scanId: string;
  githubToken: string;
  defaultBranch?: string;
};

export type FixJobData = Record<string, unknown>;

function getRedisUrl(): string {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is required to use BullMQ queues");
  }

  return redisUrl;
}

export function createRedisConnection(): IORedis {
  const options: RedisOptions = {
    maxRetriesPerRequest: null,
  };

  return new IORedis(getRedisUrl(), options);
}

export const scanQueue = new Queue<ScanJobData>(SCAN_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

export const fixQueue = new Queue<FixJobData>(FIX_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

scanQueue.on("error", (err) => {
  console.error("Scan queue error:", err);
});

fixQueue.on("error", (err) => {
  console.error("Fix queue error:", err);
});
