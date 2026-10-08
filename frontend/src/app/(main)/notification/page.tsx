"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Clock, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { RootState } from "@/redux/store";
import { useNotificationContext } from "@/components/providers/NotificationProvider";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/redux/features/notification/notificationApi";
import { INotification } from "@/types/notification";

const NotificationModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Get token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Use global notification context instead of creating new socket connection
  const {
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount,
  } = useNotificationContext();

  // Fetch notifications from API
  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useGetNotificationsQuery(
    {
      page,
      limit,
      isRead: activeTab === "unread" ? false : undefined,
    },
    { skip: !token }
  );

  // Fetch unread count
  const { data: unreadCountData } = useGetUnreadCountQuery(undefined, {
    skip: !token,
  });

  // Mutations
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadCountData?.data || realtimeUnreadCount || 0;
  const totalPages = notificationsData?.meta?.totalPage || 1;

  // Refetch when realtime notifications arrive
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      refetch();
    }
  }, [realtimeNotifications, refetch]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch {
      // Error handled silently
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch {
      // Error handled silently
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
    } catch {
      // Error handled silently
    }
  };

  const getNotificationIcon = () => {
    return <Briefcase className="w-5 h-5" />;
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 px-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Notifications</h2>
              <p className="text-blue-100 text-sm">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 bg-white bg-opacity-20 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === "all"
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-white hover:bg-opacity-20"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === "unread"
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-white hover:bg-opacity-20"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
            <button
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-500 text-sm">
                {activeTab === "unread"
                  ? "No unread notifications"
                  : "You have no notifications"}
              </p>
            </div>
          ) : (
            notifications.map((notification: INotification) => (
              <div
                key={notification._id}
                className={`relative px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => handleMarkAsRead(notification._id)}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

                <div className="flex items-start space-x-3">
                  {/* Avatar/Icon */}
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                      {getNotificationIcon()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                          {notification.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(notification.createdAt)}
                        </div>
                      </div>

                      {/* More Options */}
                      <button
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors shrink-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
