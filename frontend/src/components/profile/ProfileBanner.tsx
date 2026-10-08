"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProfileBannerProps {
  bannerUrl: string | null;
  onBannerUpdate: (file: File) => Promise<void>;
  isUpdating?: boolean;
}

/**
 * ProfileBanner Component
 *
 * A reusable banner section with image upload functionality.
 * Follows best practices:
 * - Separation of concerns (UI vs business logic)
 * - Accessibility (proper ARIA labels, semantic HTML)
 * - Performance (optimized image loading with Next.js Image)
 * - User feedback (loading states, error handling)
 * - Responsive design (mobile and desktop friendly)
 */
export default function ProfileBanner({
  bannerUrl,
  onBannerUpdate,
  isUpdating = false,
}: ProfileBannerProps) {
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
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
      await onBannerUpdate(file);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Banner upload error:", error);
    } finally {
      // Reset input to allow re-uploading the same file
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative h-48 lg:h-64 bg-linear-to-br from-gray-100 via-gray-50 to-gray-50 rounded-lg overflow-hidden group">
      {/* Banner Image */}
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt="Profile banner"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">No banner image</p>
          </div>
        </div>
      )}

      {/* Banner Edit Button */}
      <div className="absolute top-4 right-4 z-10">
        <input
          type="file"
          accept="image/*"
          onChange={handleBannerImageChange}
          className="hidden"
          ref={bannerInputRef}
          disabled={isUpdating}
          aria-label="Upload banner image"
        />
        <Button
          onClick={() => bannerInputRef.current?.click()}
          variant="secondary"
          size="sm"
          disabled={isUpdating}
          className="bg-white cursor-pointer hover:bg-gray-100 text-gray-700 shadow-md rounded-full px-3 py-2 flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
          aria-label={bannerUrl ? "Edit banner image" : "Add banner image"}
        >
          {isUpdating ? (
            <>
              <div
                className="h-4 w-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Updating banner"
              />
              <span className="hidden sm:inline text-sm font-medium">
                Updating...
              </span>
            </>
          ) : (
            <>
              {bannerUrl ? (
                <Edit className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline text-sm font-medium">
                {bannerUrl ? "Edit" : "Add"}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
