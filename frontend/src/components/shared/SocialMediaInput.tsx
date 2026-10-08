import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { detectSocialPlatform } from "@/utils/socialMedia";

interface SocialMediaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  value: string;
  register: UseFormRegisterReturn;
}

export function SocialMediaInput({
  value,
  register,
  className,
  ...props
}: SocialMediaInputProps) {
  const platform = detectSocialPlatform(value);
  const PlatformIcon = platform.Icon;

  return (
    <div className="relative flex items-center w-full">
      <div
        className={`absolute left-3 flex items-center justify-center transition-all duration-300 ease-in-out ${platform.colorClass}`}
      >
        <PlatformIcon className="h-5 w-5 transform transition-transform duration-300 hover:scale-110" />
      </div>
      <Input
        {...register}
        {...props}
        className={`pl-10 bg-gray-50 border-0 focus-visible:ring-2 focus-visible:ring-yellow-400 transition-all duration-200 ${className || ""}`}
      />
    </div>
  );
}
