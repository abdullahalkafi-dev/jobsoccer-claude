import { baseApi } from "@/redux/api/baseApi";
import {
  INotificationListResponse,
  INotificationResponse,
  IUnreadCountResponse,
  IDeleteResponse,
} from "@/types/notification";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications with pagination and filtering
    getNotifications: builder.query<
      INotificationListResponse,
      { page?: number; limit?: number; isRead?: boolean }
    >({
      query: ({ page = 1, limit = 10, isRead }) => {
        let url = `/notifications?page=${page}&limit=${limit}`;
        if (isRead !== undefined) {
          url += `&isRead=${isRead}`;
        }
        return url;
      },
      providesTags: ["Notification"],
    }),

    // Get single notification by ID
    getNotificationById: builder.query<INotificationResponse, string>({
      query: (notificationId) => `/notifications/${notificationId}`,
      providesTags: (_result, _error, id) => [{ type: "Notification", id }],
    }),

    // Get unread notification count
    getUnreadCount: builder.query<IUnreadCountResponse, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["NotificationCount"],
    }),

    // Mark single notification as read
    markAsRead: builder.mutation<INotificationResponse, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Notification", id },
        "Notification",
        "NotificationCount",
      ],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<IDeleteResponse, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification", "NotificationCount"],
    }),

    // Delete single notification
    deleteNotification: builder.mutation<IDeleteResponse, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Notification", id },
        "Notification",
        "NotificationCount",
      ],
    }),

    // Delete all notifications
    deleteAllNotifications: builder.mutation<IDeleteResponse, void>({
      query: () => ({
        url: "/notifications/all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification", "NotificationCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} = notificationApi;
