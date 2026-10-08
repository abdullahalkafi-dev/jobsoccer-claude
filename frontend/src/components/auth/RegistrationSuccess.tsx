"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

interface SuccessMessageProps {
  userName?: string;
  onNext?: () => void;
}

export default function SuccessMessage({
  userName = "User",
  onNext,
}: SuccessMessageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 md:px-5 lg:px-8 ">
      <div className="max-w-xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Yellow glow effect */}
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 scale-150"></div>
            {/* Main yellow circle */}
            <div className="relative bg-primary rounded-full w-20 h-20 flex items-center justify-center">
              <Check className="w-8 h-8 text-black font-bold" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl text-gray-600 mb-2">Hi, {userName}</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Jobsoccer
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your information has been successfully saved. We&apos;re currently
            upgrading our Soccer job platform. Please bear with us as we work
            to ensure it delivers precise opportunities for our users.
          </p>
        </div>

        {/* Next Button */}
        <Button
          onClick={onNext}
          className="bg-primary cursor-pointer hover:bg-amber-300 text-black font-medium px-8 py-3 rounded-md transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
