// Notification Types
export interface INotification {
  _id: string;
  title: string;
  description: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Interfaces
export interface INotificationResponse {
  success: boolean;
  message: string;
  data: INotification;
}

export interface INotificationListResponse {
  success: boolean;
  message: string;
  data: INotification[];
  meta: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
}

export interface IUnreadCountResponse {
  success: boolean;
  message: string;
  data: number;
}

export interface IDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount?: number;
    modifiedCount?: number;
  } | null;
}

// Socket Event Payloads
export interface INewNotificationPayload {
  success: boolean;
  notification: INotification;
}

export interface INotificationCountPayload {
  success: boolean;
  unreadCount: number;
}
