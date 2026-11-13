import { onlineUsers } from "./socketInit";
import { userRoom } from "./emitToUser";

/**
 * Get socket ID by user ID
 */
export const getSocketIdByUserId = (userId: string): string | undefined => {
  const user = Array.from(onlineUsers.values()).find(
    (user) => user.userId === userId
  );
  return user?.socketId;
};

/**
 * Get user ID by socket ID
 */
export const getUserIdBySocketId = (socketId: string): string | undefined => {
  const user = onlineUsers.get(socketId);
  return user?.userId;
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  return Array.from(onlineUsers.values()).some(
    (user) => user.userId === userId
  );
};

/**
 * Get all online user IDs
 */
export const getOnlineUserIds = (): string[] => {
  return Array.from(onlineUsers.values()).map((user) => user.userId);
};

/**
 * Get count of online users
 */
export const getOnlineUsersCount = (): number => {
  return onlineUsers.size;
};

/**
 * Remove user from online users
 */
export const removeOnlineUser = (socketId: string): boolean => {
  return onlineUsers.delete(socketId);
};

/**
 * Emit to a user if online: to their room, so every open tab/device receives it
 * (a user often has more than one connection).
 */
export const emitToUser = (
  io: any,
  userId: string,
  event: string,
  data: any
): boolean => {
  if (!isUserOnline(userId)) return false;
  io.to(userRoom(userId)).emit(event, data);
  return true;
};

/**
 * Emit to multiple users
 */
export const emitToUsers = (
  io: any,
  userIds: string[],
  event: string,
  data: any
): number => {
  let sentCount = 0;
  userIds.forEach((userId) => {
    if (emitToUser(io, userId, event, data)) {
      sentCount++;
    }
  });
  return sentCount;
};
