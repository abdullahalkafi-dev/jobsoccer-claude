"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Clock, Bell, CheckCircle, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNotificationContext } from "@/components/providers/NotificationProvider";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/redux/features/notification/notificationApi";
import { INotification } from "@/types/notification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NotificationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Get token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Get real-time notifications from context
  const { notifications: realtimeNotifications } = useNotificationContext();

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
    { skip: !token || !isOpen }
  );

  // Refetch when modal opens or real-time notifications arrive
  useEffect(() => {
    if (isOpen && realtimeNotifications.length > 0) {
      refetch();
    }
  }, [isOpen, realtimeNotifications.length, refetch]);

  // Mutations
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // Merge real-time notifications with API notifications
  const allNotifications = useMemo(() => {
    const apiNotifications = notificationsData?.data || [];

    // Filter real-time notifications that are not already in API results
    const newRealtimeNotifications = realtimeNotifications.filter(
      (rtNotif) =>
        !apiNotifications.some((apiNotif) => apiNotif._id === rtNotif._id)
    );

    // Combine and sort by creation date (newest first)
    const combined = [...newRealtimeNotifications, ...apiNotifications];
    return combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notificationsData?.data, realtimeNotifications]);

  // Filter notifications based on active tab
  const notifications = useMemo(() => {
    if (activeTab === "unread") {
      return allNotifications.filter((n) => !n.isRead);
    }
    return allNotifications;
  }, [allNotifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages = notificationsData?.meta?.totalPage || 1;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant={activeTab === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("unread")}
              className="flex-1"
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Button>
          </div>
        </DialogHeader>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
            <Button
              variant="link"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="p-0 h-auto"
            >
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {activeTab === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </p>
            </div>
          ) : (
            notifications.map((notification: INotification, index: number) => (
              <div
                key={notification._id}
                className={`flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-blue-50" : ""
                } ${
                  index !== notifications.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onClick={() => handleMarkAsRead(notification._id)}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                )}

                {/* Avatar */}
                <Avatar className="w-10 h-10 shrink-0 mt-1">
                  <AvatarFallback className="bg-purple-600 text-white">
                    <Bell className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 leading-tight">
                      {notification.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-200 shrink-0 ml-2"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                    {notification.description}
                  </p>

                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimestamp(notification.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
