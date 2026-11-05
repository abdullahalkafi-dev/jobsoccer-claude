import { logger } from "../logger/logger";
import { aiConfig } from "./ai.config";
import { startWorker } from "./queue/aiQueue";
import { AiEvaluationService } from "../../modules/aiEvaluation/aiEvaluation.service";
import { JobMatchService } from "../../modules/jobApply/jobMatch.service";
import { ProfileQualityService } from "../../modules/profileQuality/profileQuality.service";

/**
 * Start the background workers inside the API process (AI_WORKER_ENABLED,
 * default on when AI_EVAL_ENABLED). Jobs left unfinished by a restart are re-queued.
 *
 * The Profile Quality worker always runs: the score is mostly rules (no AI cost),
 * and the AI text judgement inside it degrades gracefully when AI is off.
 */
export const startAiBackgroundWork = async (): Promise<void> => {
  startWorker("profileQuality", async (job) => {
    await ProfileQualityService.recalculate(job.data.id);
  });

  const enabled = process.env.AI_WORKER_ENABLED ? process.env.AI_WORKER_ENABLED === "true" : aiConfig.evalEnabled;
  if (!enabled) {
    logger.info("AI interview / caption / job-match workers not started (AI_EVAL_ENABLED / AI_WORKER_ENABLED off)");
    return;
  }

  startWorker("interview", (job, isFinalAttempt) => AiEvaluationService.processEvaluation(job.data.id, isFinalAttempt));
  startWorker("captions", (job) => AiEvaluationService.processCaptions(job.data.id, job.data.userId!));
  startWorker("jobMatch", (job, isFinalAttempt) => JobMatchService.processMatch(job.data.id, isFinalAttempt));

  const requeued = (await AiEvaluationService.requeuePending()) + (await JobMatchService.requeuePending());
  if (requeued) logger.info(`Re-queued ${requeued} unfinished AI job(s)`);
};
