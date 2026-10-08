/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEmailVerifyMutation,
  useGetMeQuery,
  useResendOtpMutation,
} from "@/redux/features/auth/authApi";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import { Spinner } from "@/components/ui/spinner";

function EmailVerificationPageContent() {
  // local state
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  // api
  const [emailVerify, { isLoading }] = useEmailVerifyMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // global state
  const token = useAppSelector((state) => state.auth.token);

  // api read actions
  const { data: user } = useGetMeQuery(undefined, { skip: !token });

  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const email = searchParams.get("email");
  const reason: "account_verification" | "password_reset" = searchParams.get(
    "reason"
  ) as any;

  // Redirect if no email is provided
  useEffect(() => {
    if (!email || !reason) {
      router.replace("/signup");
    }
  }, [email, router, reason]);

  useEffect(() => {
    if (reason === "password_reset") {
      // Don't redirect based on user type for password reset
      return;
    }

    if (user?.data.userType) {
      if (user.data.userType === "candidate") router.push(`/create-profile/candidate`);
      else router.push(`/create-profile/employer`);
    }
  }, [user, router, reason]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!email || !reason) return;

    try {
      await resendOtp({ email, reason }).unwrap();
      toast.success("Verification code resent successfully!");
    } catch (error: any) {
      toast.error("Failed to resend verification code. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (!email || !reason) {
      toast.error("Email and reason are required");
      return;
    }

    const stringOtp = otp.join("");
    if (stringOtp.length !== 6) {
      toast.error("Please enter a complete verification code");
      return;
    }

    const payload = {
      email,
      reason,
      oneTimeCode: stringOtp,
    };

    try {
      const res = await emailVerify(payload).unwrap();

      if (res.success) {
        toast.success("Email verified successfully!");

        if (user?.data.userType) {
          if (user.data.userType === "candidate")
            router.push(`/create-profile/candidate`);
          else router.push(`/create-profile/employer`);
        }

        // Redirect based on reason
        if (reason === "password_reset") {
          const resetToken = res.data;
          router.push(
            `/create-new-password?token=${encodeURIComponent(resetToken)}`
          );
        }
      }
    } catch (error) {
      toast.error("Failed to verify email. Please try again.");
      // Clear OTP fields on error
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden flex-1 md:flex items-center justify-center px-2 md:px-5 lg:px-8 bg-primary">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-[#010A18] leading-tight">
            Confirm Your Email to Activate Your Soccer Job Profile.
          </h2>
          <p className="text-[#837E5B] mt-1">
            We’ve sent a verification code to your email — enter it below to
            continue.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-2 md:px-5 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Verify Your Email
              </h2>
            </div>

            {/* OTP Input */}
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-medium border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                />
              ))}
            </div>

            {/* Resend Code */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-1">
                {"Didn't get OTP Code?"}
              </p>
              <button
                onClick={handleResendCode}
                disabled={isResending || !email}
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                {isResending ? "Resending..." : "Resend Code"}
              </button>
            </div>

            {/* Verify Button */}
            <Button
              className="w-full bg-primary text-[#252525] py-3 rounded-lg text-base font-medium mb-4 cursor-pointer disabled:opacity-50"
              disabled={otp.some((digit) => !digit) || isLoading || !email}
              onClick={handleVerify}
            >
              {isLoading ? <Spinner /> : "Verify"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerificationPageContent />
    </Suspense>
  );
}
