import { logger } from "../logger/logger";
import { aiConfig } from "./ai.config";
import { startAiWorker } from "./queue/aiQueue";
import { AiEvaluationService } from "../../modules/aiEvaluation/aiEvaluation.service";
import { JobMatchService } from "../../modules/jobApply/jobMatch.service";

/**
 * Start the background AI worker inside the API process (AI_WORKER_ENABLED,
 * default on when AI_EVAL_ENABLED). Jobs left unfinished by a restart are re-queued.
 */
export const startAiBackgroundWork = async (): Promise<void> => {
  const enabled = process.env.AI_WORKER_ENABLED ? process.env.AI_WORKER_ENABLED === "true" : aiConfig.evalEnabled;
  if (!enabled) {
    logger.info("AI worker not started (AI_EVAL_ENABLED / AI_WORKER_ENABLED off)");
    return;
  }
  startAiWorker({
    "evaluate-interview": async (job) => {
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      await AiEvaluationService.processEvaluation(job.data.id, isFinalAttempt);
    },
    "match-job-application": async (job) => {
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      await JobMatchService.processMatch(job.data.id, isFinalAttempt);
    },
  });
  const requeued = (await AiEvaluationService.requeuePending()) + (await JobMatchService.requeuePending());
  if (requeued) logger.info(`Re-queued ${requeued} unfinished AI job(s)`);
};
