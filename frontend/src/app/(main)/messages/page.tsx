/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MoreVertical,
  Paperclip,
  Trash2,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import { useChat } from "@/hooks/useChat";
import { chatApi, messageApi } from "@/lib/chatApi";
import { Chat, ChatMessage } from "@/types/chat";
import { useAppSelector } from "@/redux/hooks";
import {
  useCreateAgentHiringMutation,
  useLazyCheckActiveHiringQuery,
} from "@/redux/features/agentHiring/agentHiringApi";
import { toast } from "sonner";

// Interfaces
interface User {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
  userType?: string;
  role?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "file" | "image" | "video";
  fileUrl?: string;
}

interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  lastTimestamp: Date;
  isBlocked?: boolean;
  blockedBy?: string;
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [hiringAgent, setHiringAgent] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedConversationRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Get auth token and user info from Redux store
  const { token, user } = useAppSelector((state) => state.auth);
  const currentUserId = user?._id || "";
  const currentUserType = user?.userType || "";

  // Agent hiring hooks
  const [createAgentHiring] = useCreateAgentHiringMutation();
  const [checkActiveHiring, { data: activeHiringData }] =
    useLazyCheckActiveHiringQuery();

  // Get selected conversation details
  const selectedChat = conversations.find(
    (conv) => conv.id === selectedConversation
  );
  const receiverId = selectedChat?.user.id || "";

  // Initialize socket and chat hooks
  const { socket, connected, onlineUsers } = useSocket(token);

  const {
    messages: chatMessages,
    setMessages: setChatMessages,
    isTyping,
    error: chatError,
    sendMessage: socketSendMessage,
    handleTyping,
    isBlocked,
  } = useChat(token, selectedConversation, receiverId, currentUserId);

  // Convert chat messages to UI format
  const messages: Message[] = chatMessages.map((msg) => {
    console.log("messages--->", msg);
    return {
      id: msg._id,
      senderId:
        typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id,
      content: msg.content || "",
      timestamp: new Date(msg.createdAt),
      type: msg.messageType,
      fileUrl: msg.mediaUrl,
    };
  });

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) return;

      setLoadingChats(true);
      try {
        const response = await chatApi.getMyChats();
        if (response.success && response.data) {
          const chatsData = response.data as Chat[];
          const formattedConversations: Conversation[] = chatsData.map(
            (chat: Chat) => {
              // Find the other user (not the current user)
              const otherUser =
                chat.users.find((u) => u._id !== currentUserId) ||
                chat.users[0];
              const latestMsg = chat.latestMessage;

              console.log("chat--->", chat);

              return {
                id: chat._id,
                user: {
                  id: otherUser._id,
                  name: `${otherUser.firstName} ${otherUser.lastName}`,
                  avatar: otherUser.profileImage
                    ? `${process.env.NEXT_PUBLIC_BASE_URL}${otherUser.profileImage}`
                    : "/placeholder.svg?height=40&width=40",
                  online: onlineUsers.includes(otherUser._id),
                  userType: otherUser.userType,
                  role: otherUser.role,
                },
                lastMessage:
                  latestMsg?.content ||
                  latestMsg?.messageType ||
                  "No messages yet",
                lastTimestamp: latestMsg
                  ? new Date(latestMsg.createdAt)
                  : new Date(chat.createdAt),
                isBlocked: chat.isBlocked,
                blockedBy: chat.blockedBy,
              };
            }
          );

          setConversations(formattedConversations);

          // Auto-select first conversation if none selected
          if (!selectedConversation && formattedConversations.length > 0) {
            setSelectedConversation(formattedConversations[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUserId]);

  // Update online status when online users change
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        user: {
          ...conv.user,
          online: onlineUsers.includes(conv.user.id),
        },
      }))
    );
  }, [onlineUsers]);

  // Listen for new_message and chat_updated events to refresh chat list
  useEffect(() => {
    if (!socket) return;

    const refreshConversationList = async () => {
      try {
        const response = await chatApi.getMyChats();
        if (response.success && response.data) {
          const chatsData = response.data as Chat[];
          const formattedConversations: Conversation[] = chatsData.map(
            (chat: Chat) => {
              const otherUser =
                chat.users.find((u) => u._id !== currentUserId) ||
                chat.users[0];
              const latestMsg = chat.latestMessage;

              return {
                id: chat._id,
                user: {
                  id: otherUser._id,
                  name: `${otherUser.firstName} ${otherUser.lastName}`,
                  avatar: otherUser.profileImage
                    ? `${process.env.NEXT_PUBLIC_BASE_URL}${otherUser.profileImage}`
                    : "/placeholder.svg?height=40&width=40",
                  online: onlineUsers.includes(otherUser._id),
                  userType: otherUser.userType,
                  role: otherUser.role,
                },
                lastMessage:
                  latestMsg?.content ||
                  latestMsg?.messageType ||
                  "No messages yet",
                lastTimestamp: latestMsg
                  ? new Date(latestMsg.createdAt)
                  : new Date(chat.createdAt),
                isBlocked: chat.isBlocked,
                blockedBy: chat.blockedBy,
              };
            }
          );

          setConversations(formattedConversations);
        }
      } catch (error) {
        console.error("Failed to refresh conversations:", error);
      }
    };

    const handleNewMessage = (data: { message: ChatMessage }) => {
      const currentSelectedConversation = selectedConversationRef.current;

      // Update conversation list to show new message in sidebar
      refreshConversationList();

      // If message is for currently selected chat, also add it directly to ensure it shows
      if (
        currentSelectedConversation &&
        data.message.chatId === currentSelectedConversation
      ) {
        setChatMessages((prev) => {
          // Check if message already exists
          if (prev.find((m) => m._id === data.message._id)) {
            return prev;
          }
          const newList = [...prev, data.message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return newList;
        });
      }
    };

    const handleChatUpdated = () => {
      refreshConversationList();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("chat_updated", handleChatUpdated);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("chat_updated", handleChatUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, currentUserId, onlineUsers]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (selectedConversation && token) {
      // Reset initial load flag when conversation changes
      isInitialLoadRef.current = true;

      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const response = await messageApi.getMessagesByChatId(
            selectedConversation
          );
          if (response.success && response.data) {
            const messagesData = response.data as ChatMessage[];
            // Sort messages by timestamp
            const sortedMessages = messagesData.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
            setChatMessages(sortedMessages);
          }
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        } finally {
          setLoadingMessages(false);
        }
      };
      fetchMessages();
    } else {
      // Clear messages when no conversation is selected
      setChatMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, token]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0 && messagesEndRef.current) {
      // Use instant scroll for initial load, smooth for new messages
      const behavior = isInitialLoadRef.current ? "auto" : "smooth";
      messagesEndRef.current.scrollIntoView({ behavior });

      // After first scroll, set to false so subsequent messages scroll smoothly
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    }
  }, [messages.length]); // Only scroll when message count changes

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = conversations.find(
    (conv) => conv.id === selectedConversation
  )?.user;

  // Handle sending message
  const handleSendMessage = async () => {
    if (isBlocked) {
      toast.error("Cannot send message. This conversation is blocked.");
      return;
    }

    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    if (!selectedConversation || !receiverId) {
      return;
    }

    if (!connected) {
      toast.warning("Not connected. Please wait for connection...");
      return;
    }

    // Stop typing indicator
    handleTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      if (selectedFile) {
        // Handle file upload - upload to backend via REST API
        setUploadingFile(true);

        // Upload file to backend API
        const uploadResponse = await messageApi.sendMessageWithFile(
          selectedConversation,
          receiverId,
          selectedFile,
          newMessage || undefined
        );

        if (uploadResponse.success && uploadResponse.data) {
          const messageData = uploadResponse.data as ChatMessage;

          // Add the message to local state immediately
          setChatMessages((prev) => {
            // Check if message already exists
            if (prev.find((m) => m._id === messageData._id)) {
              return prev;
            }
            const newList = [...prev, messageData].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
            return newList;
          });

          // Note: Backend automatically emits socket event to receiver
        }

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        // Send text message via socket
        await socketSendMessage(newMessage, "text", undefined, currentUserId);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        `Failed to send message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Start typing indicator
    if (value.length > 0) {
      handleTyping(true);

      // Stop typing after 2 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 2000);
    } else {
      handleTyping(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDeleteConversation = async () => {
    if (selectedConversation) {
      try {
        await chatApi.deleteChat(selectedConversation);
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== selectedConversation)
        );
        setSelectedConversation(null);
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        toast.error("Failed to delete conversation. Please try again.");
      }
    }
  };

  const handleBlockUser = async () => {
    if (!selectedConversation) return;

    try {
      await chatApi.blockUser(selectedConversation);
      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, isBlocked: true, blockedBy: currentUserId }
            : conv
        )
      );
      toast.success("User blocked successfully");
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Failed to block user. Please try again.");
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedConversation) return;

    try {
      await chatApi.unblockUser(selectedConversation);
      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, isBlocked: false, blockedBy: undefined }
            : conv
        )
      );
      toast.success("User unblocked successfully");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Failed to unblock user. Please try again.");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Check active hiring when conversation is selected and receiver is an agent
  useEffect(() => {
    if (
      selectedUser &&
      selectedUser.role === "Agent" &&
      currentUserType === "candidate"
    ) {
      checkActiveHiring(selectedUser.id);
    }
  }, [selectedUser, currentUserType, checkActiveHiring]);

  // Handle Hire Agent
  const handleHireAgent = async () => {
    if (!selectedUser || selectedUser.role !== "Agent") {
      toast.error("Selected user is not an agent");
      return;
    }

    // Check if already has active hiring
    if (activeHiringData?.data?.hasActiveHiring) {
      toast.warning("You already have an active hiring with this agent");
      return;
    }

    setHiringAgent(true);
    try {
      const response = await createAgentHiring({
        agentUserId: selectedUser.id,
      }).unwrap();

      if (response.success) {
        toast.success("Hiring request sent successfully!");
        // Refresh active hiring status
        checkActiveHiring(selectedUser.id);
      }
    } catch (error) {
      console.error("Failed to hire agent:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as any).data?.message
          : "Unknown error";
      toast.error(
        errorMessage || "Failed to send hiring request. Please try again."
      );
    } finally {
      setHiringAgent(false);
    }
  };

  console.log("Rendered MessagesPage", messages);

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem-80px)] max-h-[calc(100vh-4rem-80px)] bg-white border border-gray-200 rounded-lg overflow-hidden my-4">
      {/* Left Sidebar: Conversations List */}
      <div
        className={`${
          selectedConversation ? "hidden md:block" : "block"
        } w-full md:w-1/3 lg:w-1/4 border-r shrink-0 flex flex-col h-full overflow-y-auto`}
      >
        <div className="p-4">
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-xl">Messages</h3>
          {connected ? (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Connected
            </span>
          ) : (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              {token ? "Connecting..." : "Not logged in"}
            </span>
          )}
        </div>
        <ScrollArea className="flex-1">
          {loadingChats ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            filteredConversations.map((conv) => {
              return (
                <div
                  key={conv.id}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-200 relative ${
                    selectedConversation === conv.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <Image
                        src={conv.user.avatar}
                        alt={conv.user.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {conv.user.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        {conv.user.name}
                        {conv.isBlocked && (
                          <span className="text-xs text-red-600 font-normal">
                            (Blocked)
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conv.lastTimestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </div>

      {/* Right: Chat Window */}
      <div
        className={`${
          !selectedConversation ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-2/3 lg:w-3/4`}
      >
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2"
                  onClick={() => setSelectedConversation(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <Image
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="ml-3 font-semibold">{selectedUser.name}</h2>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost">
                  <Link
                    href={`/${selectedUser.userType}s/${selectedUser.id}`}
                    className="flex items-center"
                  >
                    View Profile
                  </Link>
                </Button>
                {selectedUser.role === "Agent" &&
                  currentUserType === "candidate" && (
                    <Button
                      variant="default"
                      onClick={handleHireAgent}
                      disabled={
                        hiringAgent || activeHiringData?.data?.hasActiveHiring
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {hiringAgent ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Hiring...
                        </>
                      ) : activeHiringData?.data?.hasActiveHiring ? (
                        activeHiringData.data.hiring?.status === "pending" ? (
                          "Request Pending"
                        ) : (
                          "Hired"
                        )
                      ) : (
                        "Hire"
                      )}
                    </Button>
                  )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    {selectedChat?.isBlocked ? (
                      <button
                        onClick={handleUnblockUser}
                        className="flex items-center p-2 hover:bg-gray-100 w-full text-left"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Unblock User
                      </button>
                    ) : (
                      <button
                        onClick={handleBlockUser}
                        className="flex items-center p-2 hover:bg-gray-100 w-full text-left"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Block User
                      </button>
                    )}
                    <button
                      onClick={handleDeleteConversation}
                      className="flex items-center p-2 hover:bg-gray-100 text-red-600 w-full text-left"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-2 md:p-4 overflow-y-auto">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-[500px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : isBlocked ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>This conversation is blocked</p>
                    <p className="text-sm mt-1">
                      {selectedChat?.blockedBy === currentUserId
                        ? "You blocked this user"
                        : "You have been blocked by this user"}
                    </p>
                  </div>
                </div>
              ) : chatError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>{chatError}</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 ${
                        msg.senderId === currentUserId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] md:max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === currentUserId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.type === "text" ? (
                          <p className="break-all">{msg.content}</p>
                        ) : msg.type === "image" ? (
                          <div>
                            <div className="relative w-48 h-48 mb-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`${process.env.NEXT_PUBLIC_BASE_URL}${msg.fileUrl}`}
                                alt="Image"
                                className="w-48 h-48 object-cover rounded"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.error(
                                    "Image failed to load:",
                                    `${process.env.NEXT_PUBLIC_BASE_URL}${msg.fileUrl}`
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                                onLoad={() => {
                                  console.log(
                                    "Image loaded successfully:",
                                    `${process.env.NEXT_PUBLIC_BASE_URL}${msg.fileUrl}`
                                  );
                                }}
                              />
                            </div>
                            {msg.content && (
                              <p className="text-sm">{msg.content}</p>
                            )}
                          </div>
                        ) : msg.type === "video" ? (
                          <div>
                            <video
                              src={msg.fileUrl}
                              controls
                              className="w-48 rounded mb-2"
                            />
                            {msg.content && (
                              <p className="text-sm">{msg.content}</p>
                            )}
                          </div>
                        ) : (
                          <a
                            href={msg.fileUrl}
                            download
                            className={`underline flex items-center gap-2 ${
                              msg.senderId === currentUserId
                                ? "text-blue-100"
                                : "text-blue-600"
                            }`}
                          >
                            <Paperclip className="h-4 w-4" />
                            {msg.content || "Download File"}
                          </a>
                        )}
                        <span className="text-xs block mt-1 opacity-75">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </ScrollArea>

            {/* Fixed Footer with Input Area */}
            <footer className="bg-white border-t p-2 md:p-4 w-full shrink-0">
              {isBlocked ? (
                <div className="text-center text-gray-500 py-4">
                  {selectedChat?.blockedBy === currentUserId
                    ? "You blocked this user. Unblock to send messages."
                    : "You cannot send messages to this user."}
                </div>
              ) : (
                <div className="flex items-center rounded-lg border bg-gray-50 p-2">
                  <Input
                    placeholder="Write your messages..."
                    value={newMessage}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border focus:ring-0 h-12"
                    disabled={uploadingFile || !connected}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={uploadingFile || !connected}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center bg-gray-100 p-2 rounded-md mx-2">
                      {selectedFile.type.startsWith("image/") ? (
                        <div className="h-10 w-10 relative mr-2">
                          <Image
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 mr-2 max-w-[100px] truncate">
                          {selectedFile.name}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    onClick={handleSendMessage}
                    className="bg-green-500 text-white hover:bg-green-600 ml-2 h-12 px-4 rounded-lg disabled:opacity-50"
                    disabled={
                      uploadingFile ||
                      !connected ||
                      (!newMessage.trim() && !selectedFile)
                    }
                    title={
                      !connected
                        ? "Waiting for connection..."
                        : !newMessage.trim() && !selectedFile
                        ? "Type a message or select a file"
                        : ""
                    }
                  >
                    {uploadingFile ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              )}
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
