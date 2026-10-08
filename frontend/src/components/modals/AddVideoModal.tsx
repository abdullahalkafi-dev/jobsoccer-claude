"use client";

import React, { useState, useRef } from "react";
import { Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UploadedVideo {
  id: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
}

interface Video {
  _id: string;
  url: string;
  title: string;
  duration: number;
  uploadedAt: string;
}

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Video;
  userId?: string;
}

export default function AddVideoModal({
  isOpen,
  onClose,
  initialData,
}: AddVideoModalProps) {
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [videoTitle, setVideoTitle] = useState(initialData?.title || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("video/") ||
        file.type === "video/mp4" ||
        file.type === "video/avi" ||
        file.type === "video/mov" ||
        file.type === "video/wmv" ||
        file.type === "video/webm"
    );

    const newVideos: UploadedVideo[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedVideos((prev) => [...prev, ...newVideos]);
  };

  const removeVideo = (videoId: string) => {
    setUploadedVideos((prev) => prev.filter((video) => video.id !== videoId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = () => {
    // Handle video submission logic here
    console.log("Submitting videos:", uploadedVideos);

    setUploadedVideos([]);
    onClose();
  };

  const handleClose = () => {
    setUploadedVideos([]);
    setVideoTitle("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left text-gray-900 font-medium">
            {isEditMode
              ? "Edit Video"
              : "Upload your highlight videos or training footage"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Title Input */}
          <div>
            <label
              htmlFor="videoTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Video Title
            </label>
            <input
              id="videoTitle"
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g., Match Highlights - Championship Game"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Upload Area */}
          {!isEditMode && (
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
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Drag & Drop or{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      Choose files
                    </button>{" "}
                    to upload
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    MP4, AVI, MOV, WMV, WEBM (Max 100MB per file)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.avi,.mov,.wmv,.webm"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Uploaded Videos Section */}
          {uploadedVideos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Uploaded Videos ({uploadedVideos.length})
              </h4>
              <div className="space-y-2">
                {uploadedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {video.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(video.size)} •{" "}
                          {video.type.split("/")[1].toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeVideo(video.id)}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isEditMode
                ? !videoTitle
                : uploadedVideos.length === 0 || !videoTitle
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isEditMode
              ? "Update Video"
              : `Upload Videos (${uploadedVideos.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
