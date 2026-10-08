"use client";

import React, { useCallback, useState } from "react";
import { Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileDropzoneProps {
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  placeholder?: string;
  className?: string;
}

// ✅ Helper function to check video duration (max 180 seconds)
const checkVideoDuration = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      resolve(duration <= 180); // ✅ Allow only if ≤ 180 seconds
    };
    video.src = URL.createObjectURL(file);
  });
};

export function FileDropzone({
  onFilesChange,
  accept = "video/*",
  multiple = false,
  maxFiles = 1,
  placeholder = "Drag & drop your files here, or",
  className = "",
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // ✅ Handle dropped files (check video duration)
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("video/")
      );

      const validFiles: File[] = [];
      for (const file of droppedFiles) {
        const isValid = await checkVideoDuration(file);
        if (isValid) {
          validFiles.push(file);
        } else {
          toast.error(`${file.name} is longer than 180 seconds.`);
        }
      }

      const newFiles = multiple
        ? [...files, ...validFiles].slice(0, maxFiles)
        : [validFiles[0]].filter(Boolean);

      setFiles(newFiles);
      onFilesChange(newFiles);
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  // ✅ Handle file selection (check video duration)
  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith("video/")
      );

      const validFiles: File[] = [];
      for (const file of selectedFiles) {
        const isValid = await checkVideoDuration(file);
        if (isValid) {
          validFiles.push(file);
        } else {
          toast.error(`${file.name} is longer than 180 seconds.`);
        }
      }

      const newFiles = multiple
        ? [...files, ...validFiles].slice(0, maxFiles)
        : [validFiles[0]].filter(Boolean);

      setFiles(newFiles);
      onFilesChange(newFiles);

      e.target.value = ""; // Reset input to allow same file again
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
        <div className="flex items-center justify-center">
          <p className="text-gray-600">{placeholder}</p>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="link"
              size="sm"
              className="cursor-pointer text-blue-600 hover:text-blue-700 underline pl-1"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Browse
            </Button>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
