"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationContext } from "@/components/providers/NotificationProvider";
import { useGetUnreadCountQuery } from "@/redux/features/notification/notificationApi";
import NotificationDropdown from "./NotificationDropdown";

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
  showDropdown?: boolean; // If true, shows dropdown instead of navigating
}

export default function NotificationBadge({
  onClick,
  className = "",
  showDropdown = false,
}: NotificationBadgeProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Use global notification context
  const { unreadCount: realtimeUnreadCount } = useNotificationContext();

  // Fetch unread count from API
  const { data: unreadCountData, refetch } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 60000, // Poll every 60 seconds as fallback
  });

  const unreadCount = unreadCountData?.data || realtimeUnreadCount || 0;

  // Refetch when realtime count changes
  useEffect(() => {
    if (realtimeUnreadCount > 0) {
      refetch();
    }
  }, [realtimeUnreadCount, refetch]);

  const handleClick = () => {
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
        aria-label={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} unread)` : ""
        }`}
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
