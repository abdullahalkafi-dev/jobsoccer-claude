/**
 * Utility functions for chat notifications
 */

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Show browser notification
export function showNotification(title: string, options?: NotificationOptions) {
  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    new Notification(title, {
      icon: "/icon-192x192.png", // Update with your app icon
      badge: "/badge-72x72.png", // Update with your app badge
      ...options,
    });
  }
}

// Play notification sound
export function playNotificationSound() {
  const audio = new Audio("/notification.mp3"); // Add notification sound file
  audio.volume = 0.5;
  audio.play().catch((error) => {
    console.error("Failed to play notification sound:", error);
  });
}

// Get unread count badge
export function updateUnreadBadge(count: number) {
  // Update page title with unread count
  if (count > 0) {
    document.title = `(${count}) Job Soccer - Messages`;
  } else {
    document.title = "Job Soccer";
  }

  // Update favicon with badge (optional - requires canvas)
  // This is more complex and can be implemented if needed
}

// Format timestamp for messages
export function formatMessageTime(timestamp: Date): string {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInSeconds = Math.floor(
    (now.getTime() - messageDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return "Just now";
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Return formatted date for older messages
  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      messageDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// Format timestamp for message detail (inside chat)
export function formatMessageTimestamp(timestamp: Date): string {
  const messageDate = new Date(timestamp);
  return messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Check if user is online
export function isUserOnline(userId: string, onlineUsers: string[]): boolean {
  return onlineUsers.includes(userId);
}

// Generate notification text for different message types
export function getNotificationText(
  messageType: string,
  content?: string,
  fileName?: string
): string {
  switch (messageType) {
    case "text":
      return content || "Sent a message";
    case "image":
      return "📷 Sent an image";
    case "video":
      return "🎥 Sent a video";
    case "file":
      return fileName ? `📎 Sent ${fileName}` : "📎 Sent a file";
    default:
      return "Sent a message";
  }
}

/**
 * Usage Example:
 *
 * // Request notification permission on app load
 * useEffect(() => {
 *   requestNotificationPermission();
 * }, []);
 *
 * // Show notification when new message arrives
 * socket.on('new_message', (data) => {
 *   if (document.hidden) { // Only show if app is not active
 *     showNotification(
 *       data.message.senderId.firstName,
 *       {
 *         body: getNotificationText(data.message.messageType, data.message.content),
 *         icon: data.message.senderId.profileImage,
 *       }
 *     );
 *     playNotificationSound();
 *   }
 * });
 *
 * // Update unread badge
 * useEffect(() => {
 *   updateUnreadBadge(unreadCount);
 * }, [unreadCount]);
 *
 * // Format message time in UI
 * <span>{formatMessageTime(message.timestamp)}</span>
 */
