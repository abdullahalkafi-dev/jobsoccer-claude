"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
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
import { getSignInSchema, type SignInFormData } from "@/schemas/signinValidation";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { LinkedInButton } from "@/components/auth/LinkedInButton";
import { getLinkedInAuthUrl } from "@/lib/linkedinAuth";
import { useAppSelector } from "@/redux/hooks";
import { safeNextPath, writeTokenCookie } from "@/lib/authCookie";

/** The page the route guard sent the user away from (?next=/messages), if any. */
const readNextPath = (): string | null =>
  typeof window === "undefined" ? null : safeNextPath(new URLSearchParams(window.location.search).get("next"));

export default function SignInPage() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const signInSchema = useMemo(() => getSignInSchema(tv), [tv]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const router = useRouter();

  // Already signed in in this browser (the guard only lacked its cookie, e.g. after 30 days away):
  // restore the cookie and continue to where the user was going, instead of asking again.
  const savedToken = useAppSelector((state) => state.auth.token);
  const loginRestored = useAppSelector((state) => !!state.auth._persist?.rehydrated);
  const checkedSavedLogin = useRef(false);
  useEffect(() => {
    // Decide once, for the login that existed when the page opened (a fresh login below sends
    // the user on by itself, e.g. to create-profile)
    if (!loginRestored || checkedSavedLogin.current) return;
    checkedSavedLogin.current = true;
    if (!savedToken) return;
    writeTokenCookie(savedToken);
    router.replace(readNextPath() ?? "/");
  }, [loginRestored, savedToken, router]);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setError("");
    const payload = {
      email: data.email,
      password: data.password,
      loginProvider: "email",
    };

    try {
      const res = await login(payload).unwrap();

      if (res?.data?.user?.isVerified === false) {
        router.push("/signup");
        return;
      }
      if (res?.data?.accessToken) {
        toast.success(t("signin.welcomeBack"), {
          description: t("signin.signedIn"),
        });

        form.reset();
        if (res.data.user?.profileId) {
          router.push(readNextPath() ?? "/");
        } else if (res.data.user?.userType === "employer") {
          router.push("/create-profile/employer");
        } else {
          router.push("/create-profile/candidate");
        }
      }
    } catch (error: unknown) {
      const err = error as {
        data?: { message?: string; errorSources?: Array<{ message?: string }> };
      };
      const errorMessage =
        err?.data?.message ||
        err?.data?.errorSources?.[0]?.message ||
        t("signin.failed");
      setError(errorMessage);
      console.error("Sign in error:", error);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleLinkedInLogin = () => {
    // Store that this is a login flow (not signup)
    sessionStorage.setItem("linkedin_isSignup", "false");

    // Redirect to LinkedIn OAuth
    const authUrl = getLinkedInAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left side - Dark background with text */}
      <div className="hidden flex-1 md:flex items-center justify-center p-2 md:px-5 lg:px-8 bg-primary">
        {/* Home navigation link */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-md bg-black hover:bg-gray-800 text-white hover:text-white shadow-md hover:shadow-lg transition-all duration-300 z-10 group font-medium"
        >
          <IoMdArrowBack className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm">{t("home")}</span>
        </Link>
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold text-[#010A18] leading-tight">
            {t("signin.heroTitle")}
          </h2>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-2 md:px-5 lg:px-8">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t("signin.title")}
            </h2>
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

              {/* Username */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("fields.email")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={t("fields.emailPlaceholder")}
                          className="pr-10 bg-gray-100 border-gray-200"
                          {...field}
                        />
                        <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("fields.password")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("fields.passwordPlaceholder")}
                          className="pr-10 bg-gray-100 border-gray-200"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? t("fields.hidePassword") : t("fields.showPassword")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
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

              {/* Forgot Password */}
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-gray-800  cursor-pointer"
              >
                {t("signin.forgot")}
              </button>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary hover:bg-amber-300 text-[#010A18] py-3 rounded-md"
              >
                {isLoggingIn ? <Spinner /> : t("signin.submit")}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t("or")}</span>
            </div>
          </div>

          {/* LinkedIn Login Button */}
          <LinkedInButton
            onClick={handleLinkedInLogin}
            label={t("signin.linkedin")}
          />

          {/* Sign up link */}
          <div className="text-center text-sm text-gray-600 mt-6">
            {t.rich("signin.noAccount", {
              link: (chunks) => (
                <Link href="/signup" className="underline">
                  {chunks}
                </Link>
              ),
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
