"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNotifications } from "@/hooks/useNotifications";
import { INotification } from "@/types/notification";
import { Socket } from "socket.io-client";

interface NotificationContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: INotification[];
  unreadCount: number;
  addNotification: (notification: INotification) => void;
  updateUnreadCount: (count: number) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Get token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Initialize notification socket connection for authenticated users
  const notificationState = useNotifications(token);

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
}
