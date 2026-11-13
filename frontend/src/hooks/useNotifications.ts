import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch } from "@/redux/hooks";
import {
  INotification,
  INewNotificationPayload,
  INotificationCountPayload,
} from "@/types/notification";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

interface UseNotificationsReturn {
  socket: Socket | null;
  connected: boolean;
  notifications: INotification[];
  unreadCount: number;
  addNotification: (notification: INotification) => void;
  updateUnreadCount: (count: number) => void;
  clearNotifications: () => void;
}

export function useNotifications(token: string | null): UseNotificationsReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) {
      // Cleanup if no token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Prevent multiple connections
    if (socketRef.current?.connected) {
      return;
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      // Never give up: after a server restart (deploy) the tab reconnects by itself.
      // The wait grows from 1 s to at most 10 s between attempts.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      forceNew: false,
      autoConnect: true,
    });

    // Connection success events
    newSocket.on("connect", () => {
      setConnected(true);
    });

    newSocket.on("connected", () => {
      setConnected(true);
    });

    // Connection error events
    newSocket.on("connect_error", () => {
      setConnected(false);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    // Back after a drop: events sent while we were away were lost, so reload the live data once
    newSocket.io.on("reconnect", () => {
      setConnected(true);
      dispatch(
        baseApi.util.invalidateTags(["User", "Video", "ProfileQuality", "Assessment", "Notification", "NotificationCount"])
      );
    });

    // Listen for new notifications
    newSocket.on("new_notification", (data: INewNotificationPayload) => {
      if (data.success && data.notification) {
        // Add to notifications list
        setNotifications((prev) => [data.notification, ...prev]);

        // Update unread count
        setUnreadCount((prev) => prev + 1);

        // Show browser notification if permission granted
        if (
          typeof window !== "undefined" &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(data.notification.title, {
            body: data.notification.description,
            icon: "/favicon.ico",
          });
        }

        // Optional: Play notification sound
        if (typeof window !== "undefined") {
          const audio = new Audio("/notification-sound.mp3");
          audio.play().catch(() => {});
        }
      }
    });

    // Listen for notification count updates
    newSocket.on(
      "notification_count_update",
      (data: INotificationCountPayload) => {
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      }
    );

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connected");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.off("new_notification");
        socketRef.current.off("notification_count_update");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Request browser notification permission
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = useCallback((notification: INotification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket,
    connected,
    notifications,
    unreadCount,
    addNotification,
    updateUnreadCount,
    clearNotifications,
  };
}
