"use client";

import { useRef } from "react";
import Image from "next/image";
import { Edit } from "lucide-react";
import { toast } from "sonner";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  displayName: string;
  onAvatarUpdate: (file: File) => Promise<void>;
  isUpdating?: boolean;
}

/**
 * ProfileAvatar Component
 *
 * A reusable profile picture component with upload functionality.
 * Follows best practices:
 * - Separation of concerns
 * - Accessibility (alt text, ARIA labels)
 * - Performance (optimized images)
 * - User feedback (loading states)
 * - Responsive design
 */
export default function ProfileAvatar({
  avatarUrl,
  displayName,
  onAvatarUpdate,
  isUpdating = false,
}: ProfileAvatarProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    try {
      await onAvatarUpdate(file);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Avatar upload error:", error);
    } finally {
      // Reset input to allow re-uploading the same file
      if (profileInputRef.current) {
        profileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="absolute -bottom-16 left-4 lg:left-8">
      <div className="relative">
        {/* Profile Image Container */}
        <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${displayName}'s profile picture`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 96px, 128px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-2xl lg:text-4xl font-bold text-gray-400">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <input
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
          className="hidden"
          ref={profileInputRef}
          disabled={isUpdating}
          aria-label="Upload profile picture"
        />
        <button
          onClick={() => profileInputRef.current?.click()}
          disabled={isUpdating}
          className="absolute cursor-pointer bottom-0 right-0 w-6 h-6 lg:w-10 lg:h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center justify-center border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Edit profile picture"
        >
          {isUpdating ? (
            <div
              className="h-3 w-3 lg:h-4 lg:w-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"
              role="status"
              aria-label="Updating profile picture"
            />
          ) : (
            <Edit
              className="h-3 w-3 lg:h-4 lg:w-4 text-gray-700"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </div>
  );
}
