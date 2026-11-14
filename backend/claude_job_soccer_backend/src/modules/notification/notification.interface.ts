import { Types } from "mongoose";

export type TNotification = {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  userId: Types.ObjectId;
  /** Stable notification type (see shared/i18n/notifications.ts). Old notifications have none. */
  type?: string;
  /** Values for the type's text; title/description are rendered from them in the reader's language. */
  params?: Record<string, unknown>;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
