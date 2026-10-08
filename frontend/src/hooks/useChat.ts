import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";

interface Message {
  _id: string;
  chatId: string;
  senderId: string | { _id: string };
  receiverId: string | { _id: string };
  content?: string;
  mediaUrl?: string;
  messageType: "text" | "image" | "video" | "file";
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseChatReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isTyping: boolean;
  connected: boolean;
  error: string | null;
  sendMessage: (
    content: string,
    messageType?: "text" | "image" | "video" | "file",
    mediaUrl?: string,
    currentUserId?: string
  ) => Promise<Message>;
  handleTyping: (isTypingNow: boolean) => void;
  markAsRead: () => Promise<void>;
  isBlocked: boolean;
}

export function useChat(
  token: string | null,
  chatId: string | null,
  receiverId: string | null,
  currentUserId?: string | null
): UseChatReturn {
  const {
    socket,
    connected,
    sendMessage: socketSendMessage,
    markAsRead: socketMarkAsRead,
    startTyping,
    stopTyping,
  } = useSocket(token);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const pendingMessagesRef = useRef<Set<string>>(new Set());

  // Store chatId in ref to avoid stale closures
  const chatIdRef = useRef(chatId);
  const receiverIdRef = useRef(receiverId);

  useEffect(() => {
    chatIdRef.current = chatId;
    receiverIdRef.current = receiverId;
  }, [chatId, receiverId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNewMessage = (data: { message: Message }) => {
      const currentChatId = chatIdRef.current;

      // Check if message belongs to current chat (handle both string and null cases)
      if (currentChatId && data.message.chatId === currentChatId) {
        setMessages((prev) => {
          // Avoid duplicates - check both _id and optimistic IDs
          const isDuplicate = prev.find((m) => m._id === data.message._id);
          if (isDuplicate) {
            return prev;
          }

          // Remove any pending optimistic messages for this message
          pendingMessagesRef.current.delete(data.message._id);

          // Add message and sort by timestamp
          const newMessages = [...prev, data.message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return newMessages;
        });
      }
    };

    const handleMessageSent = (data: {
      success: boolean;
      message: Message;
    }) => {
      const currentChatId = chatIdRef.current;

      console.log("✉️ Received message_sent event:", {
        messageId: data.message._id,
        chatId: data.message.chatId,
        currentChatId: currentChatId,
        success: data.success,
      });

      // Handle message_sent confirmation for our own messages
      if (data.message.chatId === currentChatId && data.success) {
        setMessages((prev) => {
          // Check if message already exists
          const existingIndex = prev.findIndex(
            (m) => m._id === data.message._id
          );

          if (existingIndex >= 0) {
            // Update existing message (in case it was optimistic)
            console.log("✅ Updating existing message");
            const updated = [...prev];
            updated[existingIndex] = data.message;
            pendingMessagesRef.current.delete(data.message._id);
            return updated;
          }

          // Add new message if not found
          console.log("✅ Adding new message from message_sent");
          pendingMessagesRef.current.delete(data.message._id);
          const newMessages = [...prev, data.message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return newMessages;
        });
      }
    };

    const handleTyping = (data: { chatId: string; userId: string }) => {
      if (
        data.chatId === chatIdRef.current &&
        data.userId === receiverIdRef.current
      ) {
        setIsTyping(true);
      }
    };

    const handleStoppedTyping = (data: { chatId: string; userId: string }) => {
      if (
        data.chatId === chatIdRef.current &&
        data.userId === receiverIdRef.current
      ) {
        setIsTyping(false);
      }
    };

    const handleMessagesRead = (data: { success: boolean; chatId: string }) => {
      if (data.chatId === chatIdRef.current && data.success) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
    };

    const handleMessagesReadByOther = (data: {
      chatId: string;
      readByUserId: string;
    }) => {
      if (data.chatId === chatIdRef.current) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
    };

    const handleChatUpdated = () => {
      // This event signals that the chat list should be refreshed
      // The parent component should handle this
    };

    const handleUserBlocked = (data: {
      success: boolean;
      chat: { _id: string };
    }) => {
      if (data.success && data.chat._id === chatIdRef.current) {
        setIsBlocked(true);
        setError("You blocked this user");
      }
    };

    const handleYouWereBlocked = (data: {
      chatId: string;
      blockedByUserId: string;
    }) => {
      if (data.chatId === chatIdRef.current) {
        setIsBlocked(true);
        setError("You have been blocked by this user");
      }
    };

    const handleUserUnblocked = (data: {
      success: boolean;
      chat: { _id: string };
    }) => {
      if (data.success && data.chat._id === chatIdRef.current) {
        setIsBlocked(false);
        setError(null);
      }
    };

    const handleYouWereUnblocked = (data: {
      chatId: string;
      unblockedByUserId: string;
    }) => {
      if (data.chatId === chatIdRef.current) {
        setIsBlocked(false);
        setError(null);
      }
    };

    const handleError = (error: { message: string }) => {
      setError(error.message);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("user_typing", handleTyping);
    socket.on("user_stopped_typing", handleStoppedTyping);
    socket.on("messages_marked_read", handleMessagesRead);
    socket.on("messages_read_by_other", handleMessagesReadByOther);
    socket.on("chat_updated", handleChatUpdated);
    socket.on("user_blocked", handleUserBlocked);
    socket.on("you_were_blocked", handleYouWereBlocked);
    socket.on("user_unblocked", handleUserUnblocked);
    socket.on("you_were_unblocked", handleYouWereUnblocked);
    socket.on("error", handleError);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("user_typing", handleTyping);
      socket.off("user_stopped_typing", handleStoppedTyping);
      socket.off("messages_marked_read", handleMessagesRead);
      socket.off("messages_read_by_other", handleMessagesReadByOther);
      socket.off("chat_updated", handleChatUpdated);
      socket.off("user_blocked", handleUserBlocked);
      socket.off("you_were_blocked", handleYouWereBlocked);
      socket.off("user_unblocked", handleUserUnblocked);
      socket.off("you_were_unblocked", handleYouWereUnblocked);
      socket.off("error", handleError);
    };
  }, [socket]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (connected && chatId) {
      socketMarkAsRead(chatId).catch(console.error);
    }
  }, [connected, chatId, socketMarkAsRead]);

  // Send message
  const sendMessage = useCallback(
    async (
      content: string,
      messageType: "text" | "image" | "video" | "file" = "text",
      mediaUrl?: string,
      userId?: string
    ) => {
      if (!chatId || !receiverId) {
        throw new Error("Chat ID and Receiver ID are required");
      }

      // Create optimistic message for instant UI update
      const optimisticId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: Message = {
        _id: optimisticId,
        chatId: chatId,
        senderId: userId || currentUserId || "", // Use current user ID for optimistic message
        receiverId: receiverId,
        content: messageType === "text" ? content : undefined,
        mediaUrl: mediaUrl,
        messageType: messageType,
        isRead: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic message immediately for better UX
      setMessages((prev) => [...prev, optimisticMessage]);
      pendingMessagesRef.current.add(optimisticId);

      try {
        const message = await socketSendMessage(
          chatId,
          receiverId,
          content,
          messageType,
          mediaUrl
        );

        // Replace optimistic message with real message from server
        setMessages((prev) => {
          // Remove the optimistic message
          const filtered = prev.filter((m) => m._id !== optimisticId);
          pendingMessagesRef.current.delete(optimisticId);

          // Check if real message already exists (from socket events)
          const exists = filtered.find((m) => m._id === message._id);
          if (exists) {
            return filtered;
          }

          // Add real message and sort by timestamp
          return [...filtered, message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        return message;
      } catch (err) {
        console.error("❌ Failed to send message:", err);

        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
        pendingMessagesRef.current.delete(optimisticId);

        const error = err as Error;
        setError(error.message);
        throw err;
      }
    },
    [chatId, receiverId, currentUserId, socketSendMessage]
  );

  // Handle typing
  const handleTyping = useCallback(
    (isTypingNow: boolean) => {
      if (!chatId || !receiverId) return;

      if (isTypingNow) {
        startTyping(chatId, receiverId);
      } else {
        stopTyping(chatId, receiverId);
      }
    },
    [chatId, receiverId, startTyping, stopTyping]
  );

  // Mark as read wrapper
  const markAsRead = useCallback(async () => {
    if (!chatId) return;
    try {
      await socketMarkAsRead(chatId);
    } catch {
      // Silently fail
    }
  }, [chatId, socketMarkAsRead]);

  return {
    messages,
    setMessages,
    isTyping,
    connected,
    error,
    sendMessage,
    handleTyping,
    markAsRead,
    isBlocked,
  };
}
