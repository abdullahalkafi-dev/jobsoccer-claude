import { io } from "./socketServer";

/** Every socket of a user joins this room, so one emit reaches all their devices. */
export const userRoom = (userId: string): string => `user:${userId}`;

/**
 * Push a live event to one user (all open tabs and devices).
 * Silently does nothing when the socket server is not running (scripts, tests).
 */
export const emitToUser = (userId: string, event: string, payload: Record<string, unknown>): void => {
  io?.to(userRoom(userId)).emit(event, payload);
};
