"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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

const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string(t("invalid")).email(t("emailInvalid")),
  });

type ForgotPasswordFormData = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const forgotPasswordSchema = useMemo(() => getForgotPasswordSchema(tv), [tv]);
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
        toast.success(t("forgot.sent"), {
          description: t("forgot.sentDescription"),
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
        t("forgot.failed");
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Yellow background with text */}
      <div className="hidden md:flex flex-1 items-center justify-center px-2 md:px-5 lg:px-8 bg-primary">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-[#010A18] leading-tight mb-4">
            {t("forgot.heroTitle")}
          </h2>
          <p className="text-[#837E5B] mt-1">
            {t("forgot.heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Right side - Reset form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("forgot.title")}
            </h2>
            <p className="text-gray-600">
              {t("forgot.subtitle")}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  <p className="font-medium">{t("error")}</p>
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
                      {t("fields.emailAddress")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("fields.emailPlaceholder")}
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
                {isLoading ? <Spinner /> : t("forgot.submit")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
