"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { X, Clock, CheckCircle, Loader2 } from "lucide-react";
import { RootState } from "@/redux/store";
import { useNotificationContext } from "@/components/providers/NotificationProvider";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/redux/features/notification/notificationApi";
import { INotification } from "@/types/notification";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Get token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Use global notification context
  const { notifications: realtimeNotifications } = useNotificationContext();

  // Fetch notifications from API
  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useGetNotificationsQuery(
    {
      page: 1,
      limit: 5, // Show only 5 in dropdown
      isRead: activeTab === "unread" ? false : undefined,
    },
    { skip: !token || !isOpen }
  );

  // Mutations
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Refetch when realtime notifications arrive
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      refetch();
    }
  }, [realtimeNotifications, refetch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "all"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "unread"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 px-4">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {activeTab === "unread"
                ? "No unread notifications"
                : "No notifications"}
            </p>
          </div>
        ) : (
          notifications.map((notification: INotification) => (
            <div
              key={notification._id}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}
              onClick={() => handleMarkAsRead(notification._id)}
            >
              <div className="flex items-start gap-3">
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                    {notification.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimestamp(notification.createdAt)}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification._id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <button
          onClick={() => {
            router.push("/notification");
            onClose();
          }}
          className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm py-2 transition-colors"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
