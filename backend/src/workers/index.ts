import type { Worker } from "bullmq";
import { startFixWorker } from "./fixWorker";
import { startScanWorker } from "./scanWorker";

let workers: Worker[] | undefined;

export function startWorkers(): Worker[] {
  if (workers) {
    return workers;
  }

  workers = [startScanWorker(), startFixWorker()];
  console.log("BullMQ workers started");

  return workers;
}
