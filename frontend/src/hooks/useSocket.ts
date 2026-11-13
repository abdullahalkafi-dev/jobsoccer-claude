import { useEffect, useState, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { ChatMessage, Chat } from "@/types/chat";
import { useNotificationContext } from "@/components/providers/NotificationProvider";

interface SocketResponse {
  success?: boolean;
  message?: ChatMessage;
  error?: { message: string };
}

interface ChatResponse {
  success?: boolean;
  chat?: Chat;
  error?: { message: string };
}

interface OnlineUsersResponse {
  success: boolean;
  onlineUsers: string[];
  count: number;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: string[];
  sendMessage: (
    chatId: string,
    receiverId: string,
    content: string,
    messageType?: "text" | "image" | "video" | "file",
    mediaUrl?: string
  ) => Promise<ChatMessage>;
  markAsRead: (chatId: string) => Promise<void>;
  startTyping: (chatId: string, receiverId: string) => void;
  stopTyping: (chatId: string, receiverId: string) => void;
  blockUser: (chatId: string) => Promise<Chat>;
  unblockUser: (chatId: string) => Promise<Chat>;
  getOnlineUsers: () => Promise<OnlineUsersResponse>;
}

/**
 * Chat actions on the tab's ONE live connection (opened by NotificationProvider).
 * It never opens a connection of its own: one connection per tab keeps the server
 * light and makes every event reach the screen that listens for it.
 */
export function useSocket(): UseSocketReturn {
  const { socket, connected } = useNotificationContext();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  socketRef.current = socket;

  useEffect(() => {
    if (!socket) return;

    const handleOnline = (data: { userId: string }) => {
      setOnlineUsers((prev) => [...new Set([...prev, data.userId])]);
    };
    const handleOffline = (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    };
    const handleList = (data: { onlineUsers: string[]; count: number }) => {
      setOnlineUsers(data.onlineUsers);
    };
    // Start from the server's list, and again after every reconnect (we may have missed changes)
    const loadList = () => {
      socket.emit("get_online_users", (response: OnlineUsersResponse) => {
        if (response?.success) setOnlineUsers(response.onlineUsers);
      });
    };

    socket.on("user_online", handleOnline);
    socket.on("user_offline", handleOffline);
    socket.on("online_users", handleList);
    socket.on("connect", loadList);
    if (socket.connected) loadList();

    return () => {
      // Only remove our own listeners: the connection is shared with the rest of the page
      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
      socket.off("online_users", handleList);
      socket.off("connect", loadList);
    };
  }, [socket]);

  // Send message function
  const sendMessage = useCallback(
    (
      chatId: string,
      receiverId: string,
      content: string,
      messageType: "text" | "image" | "video" | "file" = "text",
      mediaUrl?: string
    ): Promise<ChatMessage> => {
      return new Promise<ChatMessage>((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error("Socket not connected"));
          return;
        }

        if (!socketRef.current.connected) {
          reject(new Error("Socket disconnected"));
          return;
        }

        const payload: {
          chatId: string;
          receiverId: string;
          messageType: string;
          content?: string;
          mediaUrl?: string;
        } = {
          chatId,
          receiverId,
          messageType,
        };

        if (messageType === "text") {
          payload.content = content;
        } else {
          payload.mediaUrl = mediaUrl;
        }

        socketRef.current.emit(
          "send_message",
          payload,
          (response: SocketResponse) => {
            if (response.error) {
              reject(new Error(response.error.message));
            } else if (response.message) {
              resolve(response.message as ChatMessage);
            } else {
              reject(new Error("No message returned from server"));
            }
          }
        );
      });
    },
    []
  );

  // Mark messages as read
  const markAsRead = useCallback((chatId: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error("Socket not connected"));
        return;
      }

      socketRef.current.emit(
        "mark_messages_read",
        { chatId },
        (response: SocketResponse) => {
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve();
          }
        }
      );
    });
  }, []);

  // Typing indicators
  const startTyping = useCallback((chatId: string, receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing_start", { chatId, receiverId });
    }
  }, []);

  const stopTyping = useCallback((chatId: string, receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing_stop", { chatId, receiverId });
    }
  }, []);

  // Block user
  const blockUser = useCallback((chatId: string): Promise<Chat> => {
    return new Promise<Chat>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error("Socket not connected"));
        return;
      }

      socketRef.current.emit(
        "block_user",
        { chatId },
        (response: ChatResponse) => {
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.chat as Chat);
          }
        }
      );
    });
  }, []);

  // Unblock user
  const unblockUser = useCallback((chatId: string): Promise<Chat> => {
    return new Promise<Chat>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error("Socket not connected"));
        return;
      }

      socketRef.current.emit(
        "unblock_user",
        { chatId },
        (response: ChatResponse) => {
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.chat as Chat);
          }
        }
      );
    });
  }, []);

  // Get online users
  const getOnlineUsers = useCallback((): Promise<OnlineUsersResponse> => {
    return new Promise<OnlineUsersResponse>((resolve) => {
      if (!socketRef.current) {
        resolve({ success: false, onlineUsers: [], count: 0 });
        return;
      }

      socketRef.current.emit(
        "get_online_users",
        (response: OnlineUsersResponse) => {
          if (response.success) {
            setOnlineUsers(response.onlineUsers);
            resolve(response);
          } else {
            resolve({ success: false, onlineUsers: [], count: 0 });
          }
        }
      );
    });
  }, []);

  return {
    socket,
    connected,
    onlineUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    blockUser,
    unblockUser,
    getOnlineUsers,
  };
}
