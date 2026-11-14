"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
import {
  getCreatePasswordSchema,
  type CreatePasswordFormData,
} from "@/schemas/passwordValidation";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { Spinner } from "@/components/ui/spinner";

function CreateNewPasswordPageContent() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const createPasswordSchema = useMemo(() => getCreatePasswordSchema(tv), [tv]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // Redirect if no token is provided
  useEffect(() => {
    if (!token) {
      router.replace("/forgot-password");
    }
  }, [token, router]);

  const form = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: CreatePasswordFormData) => {
    if (!token) {
      toast.error(t("newPassword.tokenRequired"));
      return;
    }

    try {
      const payload = {
        newPassword: data.newPassword,
        token,
      };

      const res = await resetPassword(payload).unwrap();

      if (res.success) {
        toast.success(t("newPassword.updated"), {
          description: t("newPassword.updatedDescription"),
        });
        // Reset form after successful submission
        form.reset();
        router.push("/signin");
      }
    } catch (error) {
      const err = error as { data?: { message?: string; code?: string } };
      const errorMessage = err?.data?.message || t("newPassword.tryAgainLater");

      toast.error(t("newPassword.failed"), {
        description: errorMessage,
      });

      // If token expired, redirect to forgot password page
      if (
        err?.data?.code === "OTP_EXPIRED" ||
        errorMessage.includes("Token expired") ||
        errorMessage.includes("expired")
      ) {
        setTimeout(() => {
          router.push("/forgot-password");
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen md:flex">
      {/* Left side */}
      <div className="hidden flex-1 md:flex items-center justify-center px-2 md:px-5 lg:px-8 bg-primary">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-[#010A18] leading-tight">
            {t("newPassword.heroTitle")}
          </h2>
          <p className="text-[#837E5B] mt-1">
            {t("newPassword.heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Right side - Create password form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-2 md:p-5 lg:p-8">
        <div className="w-full max-w-md bg-white border-2 rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t("newPassword.title")}
            </h2>
            <p className="text-gray-600 text-sm">{t("newPassword.subtitle")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("newPassword.newPassword")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder={t("fields.passwordPlaceholder")}
                          className="pr-10 bg-gray-100 border-gray-200"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? t("fields.hidePassword") : t("fields.showPassword")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showNewPassword ? (
                            <FaEyeSlash className="h-4 w-4 text-gray-400 cursor-pointer" />
                          ) : (
                            <FaEye className="h-4 w-4 text-gray-400 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm New Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("newPassword.confirmPassword")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t("fields.passwordPlaceholder")}
                          className="pr-10 bg-gray-100 border-gray-200"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={showConfirmPassword ? t("fields.hidePassword") : t("fields.showPassword")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="h-4 w-4 text-gray-400 cursor-pointer" />
                          ) : (
                            <FaEye className="h-4 w-4 text-gray-400 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reset Password Button */}
              <Button
                type="submit"
                disabled={isLoading || !token}
                className="w-full cursor-pointer bg-primary text-[#252525] hover:bg-amber-300 py-3 rounded-md"
              >
                {isLoading ? <Spinner /> : t("newPassword.submit")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default function CreateNewPasswordPage() {
  const t = useTranslations("auth");
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <CreateNewPasswordPageContent />
    </Suspense>
  );
}
