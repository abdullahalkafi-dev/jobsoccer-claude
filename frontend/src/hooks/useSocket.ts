import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage, Chat } from "@/types/chat";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

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

export function useSocket(token: string | null): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket"], // Use websocket only for faster connection
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: false,
      autoConnect: true,
    });

    // Connection events
    newSocket.on("connect", () => {
      setConnected(true);
    });

    newSocket.on("connected", () => {
      setConnected(true);
    });

    newSocket.on("connect_error", () => {
      setConnected(false);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    // Online status events
    newSocket.on("user_online", (data: { userId: string }) => {
      setOnlineUsers((prev) => [...new Set([...prev, data.userId])]);
    });

    newSocket.on("user_offline", (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    newSocket.on(
      "online_users",
      (data: { onlineUsers: string[]; count: number }) => {
        setOnlineUsers(data.onlineUsers);
      }
    );

    newSocket.on("error", () => {
      // Handle socket error silently
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

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
