export interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  userType: "candidate" | "employer";
  role: string;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  senderId: ChatUser | string;
  receiverId: ChatUser | string;
  content?: string;
  mediaUrl?: string;
  messageType: "text" | "image" | "video" | "file";
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  users: [ChatUser, ChatUser];
  latestMessage?: ChatMessage;
  isBlocked: boolean;
  blockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
  };
  lastMessage: string;
  lastTimestamp: Date;
  unread?: number;
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
}
