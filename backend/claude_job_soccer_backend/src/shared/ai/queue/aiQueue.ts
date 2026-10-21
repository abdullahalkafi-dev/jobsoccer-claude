import { Job, Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import config from "../../../config";
import { logger } from "../../logger/logger";
import { aiConfig } from "../ai.config";

/**
 * Background queue for AI work (BullMQ on the existing Redis).
 * HTTP requests only add jobs; a worker does the slow part (ffmpeg, Whisper,
 * model calls) so uploads and applications return immediately.
 */

export const AI_QUEUE_NAME = "ai-jobs";

export type AiJobName = "evaluate-interview" | "match-job-application";

export interface AiJobData {
  /** AiEvaluation id or JobApply id, depending on the job name. */
  id: string;
}

// BullMQ needs its own connections with maxRetriesPerRequest = null.
const createConnection = () =>
  new IORedis({
    host: config.redis.host || "127.0.0.1",
    port: Number(config.redis.port) || 6379,
    maxRetriesPerRequest: null,
  });

let queue: Queue<AiJobData> | null = null;

const getQueue = (): Queue<AiJobData> => {
  if (!queue) {
    queue = new Queue<AiJobData>(AI_QUEUE_NAME, {
      connection: createConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 30_000 },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: { age: 30 * 24 * 3600 },
      },
    });
  }
  return queue;
};

/**
 * Add a job. Returns false when Redis is unavailable; the record stays
 * "queued" in MongoDB and is picked up again when the worker starts.
 */
export const enqueueAiJob = async (name: AiJobName, data: AiJobData): Promise<boolean> => {
  try {
    // jobId = record id (no ":" allowed), so the same record is never queued twice at once.
    // A finished job with that id (kept for history) would block re-running the record.
    const jobId = `${name}-${data.id}`;
    const previous = await getQueue().getJob(jobId);
    if (previous && ((await previous.isCompleted()) || (await previous.isFailed()))) await previous.remove();
    await getQueue().add(name, data, { jobId });
    return true;
  } catch (error: any) {
    logger.error(`Could not queue ${name} for ${data.id}`, { error: error.message });
    return false;
  }
};

export type AiJobHandler = (job: Job<AiJobData>) => Promise<void>;

let worker: Worker<AiJobData> | null = null;

export const startAiWorker = (handlers: Record<AiJobName, AiJobHandler>): Worker<AiJobData> => {
  if (worker) return worker;
  worker = new Worker<AiJobData>(
    AI_QUEUE_NAME,
    async (job) => {
      const handler = handlers[job.name as AiJobName];
      if (!handler) throw new Error(`No handler for AI job "${job.name}"`);
      await handler(job);
    },
    { connection: createConnection(), concurrency: aiConfig.worker.concurrency }
  );
  worker.on("failed", (job, error) => {
    logger.error(`AI job ${job?.name} ${job?.data.id} failed (attempt ${job?.attemptsMade})`, { error: error.message });
  });
  worker.on("error", (error) => logger.error("AI worker error", { error: error.message }));
  logger.info(`AI worker started (concurrency ${aiConfig.worker.concurrency})`);
  return worker;
};

export const stopAiQueue = async (): Promise<void> => {
  await worker?.close();
  await queue?.close();
  worker = null;
  queue = null;
};
