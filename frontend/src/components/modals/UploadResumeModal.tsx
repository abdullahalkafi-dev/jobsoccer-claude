/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCreateResumeMutation,
  useGetUserResumeQuery,
} from "@/redux/features/resume/resumeApi";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
  onSubmitSuccess?: (resumeUrl: string) => void;
  mode?: "profile" | "jobApplication"; // Add mode prop
}

export default function UploadResumeModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  mode = "jobApplication",
}: UploadResumeModalProps) {
  const userId = useAppSelector((state) => state.auth.user?._id);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createResume, { isLoading: isCreating }] = useCreateResumeMutation();
  const { data: existingResumes } = useGetUserResumeQuery(userId || "", {
    skip: !userId,
  });

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
        file.type === "application/pdf" || file.type.includes("document")
    );

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file: file,
    }));

    setUploadedFiles(newFiles);
    setSelectedResumeId(null);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      let resumeUrl = "";

      // If user uploaded a new file
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ userId }));
        formData.append("doc", uploadedFiles[0].file);

        const result = await createResume(formData).unwrap();
        resumeUrl = result.data?.resumeUrl || "";
        toast.success("Resume uploaded successfully!");

        // Reset form
        setUploadedFiles([]);
        setSelectedResumeId(null);
      } else if (selectedResumeId) {
        // User selected an existing resume - find it and get the URL
        const selectedResume = existingResumes?.data?.find(
          (resume: any) => resume._id === selectedResumeId
        );
        resumeUrl = selectedResume?.resumeUrl || "";

        if (mode === "profile") {
          toast.success("Resume already in your profile!");
        }
      } else {
        toast.error("Please upload or select a resume");
        return;
      }

      if (!resumeUrl) {
        toast.error("Failed to get resume URL");
        return;
      }

      // Close modal first
      console.log(
        "=== UploadResumeModal: Closing modal and calling onSubmitSuccess ==="
      );
      onClose();

      // Call parent callback with resume URL
      if (onSubmitSuccess) {
        console.log(
          "=== UploadResumeModal: Calling onSubmitSuccess with resumeUrl:",
          resumeUrl
        );
        onSubmitSuccess(resumeUrl);
      }
    } catch (error: any) {
      console.log("=== UploadResumeModal: Error in handleSubmit ===", error);
      toast.error(error.data?.message || "Failed to upload resume");
      console.error("Failed to upload resume:", error);
    }
  };

  const handleSelectExistingResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setUploadedFiles([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left text-gray-900 font-medium">
            {mode === "profile"
              ? "Upload Your Resume"
              : "You have to upload your resume (pdf) for applying this job"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
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
                    Choose file
                  </button>{" "}
                  to upload
                </p>
                <p className="text-sm text-gray-500 mt-1">pdf</p>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Existing Resumes Section */}
          {existingResumes?.data && existingResumes.data.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Your Uploaded Resumes
              </h4>
              <div className="space-y-2">
                {existingResumes.data.map((resume: any) => (
                  <div
                    key={resume._id}
                    onClick={() => handleSelectExistingResume(resume._id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      selectedResumeId === resume._id
                        ? "bg-green-50 border border-green-500"
                        : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {resume.resumeFileName || "Resume.pdf"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newly Uploaded Files Section */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                New File to Upload
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (uploadedFiles.length === 0 && !selectedResumeId) || isCreating
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isCreating
              ? "Uploading..."
              : mode === "profile"
              ? "Upload Resume"
              : "Submit Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
