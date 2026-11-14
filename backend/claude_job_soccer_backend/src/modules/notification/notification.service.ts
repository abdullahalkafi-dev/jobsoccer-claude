import { Types } from "mongoose";
import { Notification } from "./notification.model";
import { TNotification } from "./notification.interface";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { io } from "../../socket/socketServer";
import { userRoom } from "../../socket/emitToUser";
import { User } from "../user/user.model";
import { DEFAULT_LANG, isLang, Lang } from "../../shared/i18n";
import { renderNotification } from "../../shared/i18n/notifications";

export { renderNotification };

/** A notification as the reader sees it: typed ones are rendered in their language, old ones keep the stored text. */
const localize = <T extends { type?: string; params?: Record<string, unknown>; title: string; description: string }>(
  notification: T,
  lang: Lang
): T => {
  const text = renderNotification(notification.type, notification.params, lang);
  return text ? { ...notification, title: text.title, description: text.description } : notification;
};

const languageOf = async (userId: string): Promise<Lang> => {
  const user = await User.findById(userId).select("language").lean().catch(() => null);
  return isLang(user?.language) ? user.language : DEFAULT_LANG;
};

/**
 * Create a new notification and send via socket if user is online
 */
const createNotification = async (
  title: string,
  description: string,
  userId: string,
  type?: string,
  params?: Record<string, unknown>
): Promise<TNotification> => {
  // With a type, the stored title/description are the English rendering (the fallback for old readers)
  const english = renderNotification(type, params, "en");
  const notification = await Notification.create({
    title: english?.title ?? title,
    description: english?.description ?? description,
    userId: new Types.ObjectId(userId),
    isRead: false,
    ...(type ? { type, params: params ?? {} } : {}),
  });
  const readerLang = type ? await languageOf(userId) : DEFAULT_LANG;
  // Real-time copy to every open tab/device of the user (nothing happens when they are offline)
  io?.to(userRoom(userId)).emit("new_notification", {
    success: true,
    notification: localize(notification.toObject() as TNotification, readerLang),
  });

  return localize(notification.toObject() as TNotification, readerLang);
};

/**
 * Get all notifications for a user with pagination
 */
const getNotifications = async (
  userId: string,
  query: Record<string, any>,
  lang: Lang = DEFAULT_LANG
): Promise<{
  data: TNotification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = {
    userId: new Types.ObjectId(userId),
  };

  // Optional filter for read/unread
  if (query.isRead !== undefined) {
    filter.isRead = query.isRead === "true";
  }

  // Get total count
  const total = await Notification.countDocuments(filter);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    userId: new Types.ObjectId(userId),
    isRead: false,
  });

  // Get paginated data
  const data = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  return {
    data: (data as TNotification[]).map((n) => localize(n, lang)),
    meta: {
      page,
      limit,
      total,
      totalPages,
      unreadCount,
    },
  };
};

/**
 * Get a single notification by ID
 */
const getNotificationById = async (
  notificationId: string,
  userId: string,
  lang: Lang = DEFAULT_LANG
): Promise<TNotification> => {
  const notification = await Notification.findOne({
    _id: new Types.ObjectId(notificationId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!notification) {
    throw new AppError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  return localize(notification as TNotification, lang);
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (
  notificationId: string,
  userId: string,
  lang: Lang = DEFAULT_LANG
): Promise<TNotification> => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    },
    { isRead: true },
    { new: true }
  ).lean();

  if (!notification) {
    throw new AppError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  return localize(notification as TNotification, lang);
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId: string): Promise<{ modifiedCount: number }> => {
  const result = await Notification.updateMany(
    {
      userId: new Types.ObjectId(userId),
      isRead: false,
    },
    { isRead: true }
  );

  return { modifiedCount: result.modifiedCount };
};

/**
 * Delete a single notification
 */
const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  const result = await Notification.findOneAndDelete({
    _id: new Types.ObjectId(notificationId),
    userId: new Types.ObjectId(userId),
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Notification not found");
  }
};

/**
 * Delete all notifications for a user
 */
const deleteAllNotifications = async (userId: string): Promise<{ deletedCount: number }> => {
  const result = await Notification.deleteMany({
    userId: new Types.ObjectId(userId),
  });

  return { deletedCount: result.deletedCount };
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId: string): Promise<number> => {
  const count = await Notification.countDocuments({
    userId: new Types.ObjectId(userId),
    isRead: false,
  });

  return count;
};

/**
 * Send notification to user (helper function for other modules)
 * This can be called from other services to create and send notifications
 */
const sendNotificationToUser = async (
  userId: string,
  title: string,
  description: string,
  type?: string,
  params?: Record<string, unknown>
): Promise<TNotification> => {
  return createNotification(title, description, userId, type, params);
};

export const NotificationService = {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  sendNotificationToUser,
};
