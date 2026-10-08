"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string>("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError("");

    try {
      const res = await forgotPassword({ email: data.email }).unwrap();

      if (res.success) {
        toast.success("Verification code sent!", {
          description: "Please check your email for the verification code.",
        });
        // Navigate to email verification page with email and reason parameters
        router.push(
          `/email-verification?email=${encodeURIComponent(
            data.email
          )}&reason=password_reset`
        );
      }
    } catch (error) {
      const err = error as {
        data?: { message?: string; errorSources?: Array<{ message?: string }> };
      };
      const errorMessage =
        err?.data?.message ||
        err?.data?.errorSources?.[0]?.message ||
        "Failed to send code. Please try again later.";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Yellow background with text */}
      <div className="hidden md:flex flex-1 items-center justify-center px-2 md:px-5 lg:px-8 bg-primary">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-[#010A18] leading-tight mb-4">
            Reset Your Password for the Soccer Career Hub
          </h2>
          <p className="text-[#837E5B] mt-1">
            Don&#39;t worry! We&#39;re here to help you get back into your
            account.
          </p>
        </div>
      </div>

      {/* Right side - Reset form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot password
            </h2>
            <p className="text-gray-600">
              Enter your registered email to reset your password.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  <p className="font-medium">Error</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {/* Email Input Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full bg-gray-50 border-gray-200"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Send Code Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-amber-300 text-black font-medium py-3 rounded-md cursor-pointer"
              >
                {isLoading ? <Spinner /> : "Send Code"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
