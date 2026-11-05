import { Job, Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import config from "../../../config";
import { logger } from "../../logger/logger";
import { aiConfig } from "../ai.config";

/**
 * Background queues for slow work (BullMQ on the existing Redis).
 * HTTP requests only add jobs; workers do the slow part (ffmpeg, Whisper, model
 * calls), so uploads, saves and applications return immediately.
 *
 * Each kind of work has its OWN queue and concurrency, so a 6-minute interview
 * transcription never delays a 2-second profile score.
 */

export type TQueueKey = "interview" | "captions" | "jobMatch" | "profileQuality";

type TQueueDefinition = {
  name: string;
  concurrency: () => number;
  attempts: number;
  backoffMs: number;
};

const QUEUES: Record<TQueueKey, TQueueDefinition> = {
  interview: { name: "ai-interview", concurrency: () => aiConfig.concurrency.interview, attempts: 3, backoffMs: 30_000 },
  captions: { name: "ai-captions", concurrency: () => aiConfig.concurrency.captions, attempts: 3, backoffMs: 30_000 },
  jobMatch: { name: "ai-job-match", concurrency: () => aiConfig.concurrency.jobMatch, attempts: 3, backoffMs: 30_000 },
  profileQuality: { name: "ai-profile-quality", concurrency: () => aiConfig.concurrency.profileQuality, attempts: 2, backoffMs: 10_000 },
};

export interface TJobData {
  /** The record the job works on (AiEvaluation, JobApply, video or user id, depending on the queue). */
  id: string;
  /** Extra identifier for jobs that need two ids (e.g. the user of a video). */
  userId?: string;
}

// BullMQ needs its own connections with maxRetriesPerRequest = null.
const createConnection = () =>
  new IORedis({
    host: config.redis.host || "127.0.0.1",
    port: Number(config.redis.port) || 6379,
    maxRetriesPerRequest: null,
  });

const queues = new Map<TQueueKey, Queue<TJobData>>();

const getQueue = (key: TQueueKey): Queue<TJobData> => {
  let queue = queues.get(key);
  if (!queue) {
    const definition = QUEUES[key];
    queue = new Queue<TJobData>(definition.name, {
      connection: createConnection(),
      defaultJobOptions: {
        attempts: definition.attempts,
        backoff: { type: "exponential", delay: definition.backoffMs },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: { age: 30 * 24 * 3600 },
      },
    });
    queues.set(key, queue);
  }
  return queue;
};

/**
 * Add a job. Returns false when Redis is unavailable; the record stays "queued"
 * in MongoDB and is picked up again when the worker starts.
 *
 * `jobId` makes the job unique per record: adding the same record twice while it
 * is waiting does nothing. `delayMs` lets a burst of changes (5 quick profile
 * edits) collapse into one job.
 */
export const enqueueJob = async (
  key: TQueueKey,
  data: TJobData,
  options: { jobId?: string; delayMs?: number } = {}
): Promise<boolean> => {
  try {
    const queue = getQueue(key);
    // jobId may not contain ":" in BullMQ.
    const jobId = (options.jobId ?? data.id).replace(/:/g, "-");
    // A finished job with the same id (kept for history) would block running the record again.
    const previous = await queue.getJob(jobId);
    if (previous && ((await previous.isCompleted()) || (await previous.isFailed()))) await previous.remove();
    await queue.add(key, data, { jobId, ...(options.delayMs ? { delay: options.delayMs } : {}) });
    return true;
  } catch (error: any) {
    logger.error(`Could not queue ${key} job for ${data.id}`, { error: error.message });
    return false;
  }
};

export type TJobHandler = (job: Job<TJobData>, isFinalAttempt: boolean) => Promise<void>;

const workers = new Map<TQueueKey, Worker<TJobData>>();

/** Start the worker of one queue (does nothing if it is already running). */
export const startWorker = (key: TQueueKey, handler: TJobHandler): void => {
  if (workers.has(key)) return;
  const definition = QUEUES[key];
  const worker = new Worker<TJobData>(
    definition.name,
    async (job) => handler(job, job.attemptsMade + 1 >= (job.opts.attempts ?? 1)),
    { connection: createConnection(), concurrency: definition.concurrency() }
  );
  worker.on("failed", (job, error) => {
    logger.error(`${definition.name} job ${job?.data.id} failed (attempt ${job?.attemptsMade})`, { error: error.message });
  });
  worker.on("error", (error) => logger.error(`${definition.name} worker error`, { error: error.message }));
  workers.set(key, worker);
  logger.info(`Worker ${definition.name} started (concurrency ${definition.concurrency()})`);
};

export const stopAllQueues = async (): Promise<void> => {
  await Promise.all([...workers.values()].map((worker) => worker.close()));
  await Promise.all([...queues.values()].map((queue) => queue.close()));
  workers.clear();
  queues.clear();
};
