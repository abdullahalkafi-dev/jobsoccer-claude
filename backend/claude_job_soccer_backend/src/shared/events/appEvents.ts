import { EventEmitter } from "events";
import { logger } from "../logger/logger";

/**
 * Small in-process event bus. Services announce *what happened*
 * ("profile changed", "video uploaded") and listeners decide what to do
 * (recalculate the quality score, queue the AI). This keeps modules from
 * importing each other and keeps request handlers fast: a request only emits.
 */
export type TAppEvents = {
  /** Anything that feeds the Profile Quality Score changed. */
  "profile.changed": { userId: string; reason: string };
  /** A video was stored on the profile. */
  "video.uploaded": { userId: string; videoId: string; kind: string };
  /** A video was removed from the profile. */
  "video.deleted": { userId: string; kind: string };
};

class TypedEventBus {
  private readonly emitter = new EventEmitter();

  on<K extends keyof TAppEvents>(event: K, listener: (payload: TAppEvents[K]) => Promise<void> | void): void {
    this.emitter.on(event, (payload: TAppEvents[K]) => {
      // A failing listener must never break the request that emitted the event.
      Promise.resolve()
        .then(() => listener(payload))
        .catch((error: any) => logger.error(`Listener for "${event}" failed`, { error: error.message }));
    });
  }

  emit<K extends keyof TAppEvents>(event: K, payload: TAppEvents[K]): void {
    this.emitter.emit(event, payload);
  }
}

export const appEvents = new TypedEventBus();
