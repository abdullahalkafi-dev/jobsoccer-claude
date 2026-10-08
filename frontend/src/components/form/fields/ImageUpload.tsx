"use client";

import React, { useRef } from "react";
import { Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string | File;
  onChange: (file: File | null) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "Upload your image",
  className = "",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const getImageSrc = () => {
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    return value;
  };

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <div
        className="w-16 h-16 rounded-full bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={handleClick}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImageSrc()}
            alt="Uploaded"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="w-8 h-8 text-blue-400" />
        )}
      </div>
      <div className="flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClick}
          className="text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-1" />
          {placeholder}
        </Button>
        <span className="text-sm text-[#9E9E9E] ml-3">Max 100px/100px</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
