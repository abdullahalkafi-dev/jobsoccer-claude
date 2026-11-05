import { aiConfig } from "../../shared/ai/ai.config";
import { enqueueJob } from "../../shared/ai/queue/aiQueue";
import { appEvents } from "../../shared/events/appEvents";
import { VideoKind } from "../video/video.constant";
import { AiEvaluationService } from "./aiEvaluation.service";

/**
 * Connect video uploads to the AI queues. The upload request only emits an event;
 * the heavy work happens in the background workers.
 *  - Interview video      -> scored with the client's guide (+ English captions)
 *  - Methodology video    -> English captions only (employers watch it, the AI does not score it)
 */
export const registerAiEvaluationListeners = (): void => {
  appEvents.on("video.uploaded", async ({ userId, videoId, kind }) => {
    if (!aiConfig.evalEnabled) return;
    if (kind === VideoKind.INTERVIEW) {
      await AiEvaluationService.requestEvaluationSafely(userId, "interview-uploaded");
    } else if (kind === VideoKind.METHODOLOGY) {
      await enqueueJob("captions", { id: videoId, userId }, { jobId: `captions-${videoId}` });
    }
  });
};
