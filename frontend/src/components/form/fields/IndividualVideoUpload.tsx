"use client";

import React, { useCallback, useState } from "react";
import { Upload, Video, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IndividualVideoUploadProps {
  label: string;
  description?: string;
  required?: boolean;
  maxDuration?: number; // in seconds
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

/**
 * Helper function to check video duration
 */
const checkVideoDuration = (file: File, maxDuration: number): Promise<{ valid: boolean; duration: number }> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = Math.floor(video.duration);
      resolve({ valid: duration <= maxDuration, duration });
    };
    video.onerror = () => {
      resolve({ valid: false, duration: 0 });
    };
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Format duration in MM:SS format
 */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export function IndividualVideoUpload({
  label,
  description,
  required = false,
  maxDuration = 180, // 3 minutes default
  value,
  onChange,
  error,
}: IndividualVideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateAndSetFile = useCallback(
    async (file: File) => {
      // Check file type
      if (!file.type.startsWith("video/")) {
        setValidationError("Please upload a video file");
        return;
      }

      setIsValidating(true);
      setValidationError(null);

      // Check video duration
      const { valid, duration } = await checkVideoDuration(file, maxDuration);

      setIsValidating(false);

      if (!valid) {
        setValidationError(
          `Video is too long (${formatDuration(duration)}). Maximum allowed: ${formatDuration(maxDuration)}`
        );
        return;
      }

      // File is valid
      onChange(file);
    },
    [maxDuration, onChange]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        await validateAndSetFile(droppedFile);
      }
    },
    [validateAndSetFile]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        await validateAndSetFile(selectedFile);
      }
      e.target.value = ""; // Reset input
    },
    [validateAndSetFile]
  );

  const removeFile = () => {
    onChange(null);
    setValidationError(null);
  };

  const hasFile = !!value;
  const displayError = error || validationError;

  return (
    <div className="space-y-3">
      {/* Header with label and badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
          {required ? (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Optional
            </Badge>
          )}
        </div>
        {hasFile && (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {/* Upload area or file preview */}
      {!hasFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : displayError
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 ${displayError ? 'text-red-400' : 'text-gray-400'}`} />
          <div className="flex items-center justify-center gap-1">
            <p className="text-sm text-gray-600">
              Drag & drop your video or
            </p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileInput}
              className="hidden"
              id={`video-upload-${label.replace(/\s+/g, '-')}`}
              disabled={isValidating}
            />
            <label htmlFor={`video-upload-${label.replace(/\s+/g, '-')}`}>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="cursor-pointer text-blue-600 hover:text-blue-700 underline p-0 h-auto"
                onClick={() =>
                  document
                    .getElementById(`video-upload-${label.replace(/\s+/g, '-')}`)
                    ?.click()
                }
                disabled={isValidating}
              >
                {isValidating ? "Validating..." : "Browse"}
              </Button>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Max duration: {formatDuration(maxDuration)}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="shrink-0">
              <Video className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {value.name}
              </p>
              <p className="text-xs text-gray-600">
                {formatFileSize(value.size)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-red-500 hover:text-red-700 hover:bg-red-100 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
}
