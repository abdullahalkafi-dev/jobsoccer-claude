/**
 * Example component showing how to start a chat with a user
 *
 * You can use this in your candidate or employer profile pages
 * to add a "Message" button that creates/opens a chat
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { chatApi } from "@/lib/chatApi";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { LoginRequiredModal } from "../modals/LoginRequiredModal";

interface StartChatButtonProps {
  userId: string;
  userName: string;
  className?: string;
}

export function StartChatButton({
  userId,
  className,
}: StartChatButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkAuth, showLoginModal, handleLogin, handleCloseModal } =
    useAuthCheck();

  const handleStartChat = async () => {
    if (!checkAuth(async () => {
      await handleStartChatLogic();
    })) {
      return;
    }
  };

  const handleStartChatLogic = async () => {
    setLoading(true);
    try {
      // Create or get existing chat with this user
      const response = await chatApi.createOrGetChat(userId);

      if (response.success && response.data) {
        // Navigate to messages page
        // The messages page will automatically select this chat
        router.push("/messages");

        // Optionally, you can also pass the chatId as a query parameter
        // router.push(`/messages?chatId=${response.data._id}`);
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleStartChat} disabled={loading} className={className}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <MessageCircle />
            Message 
          </>
        )}
      </Button>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
        message="Please log in to send messages."
      />
    </>
  );
}
