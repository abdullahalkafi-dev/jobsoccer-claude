/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
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
import { getSignUpSchema, type SignUpFormData } from "@/schemas/signupValidation";
import { useRouter } from "next/navigation";
import RoleSelect from "@/components/input/SelectRole";
import { useSignupMutation } from "@/redux/features/auth/authApi";
import { Spinner } from "@/components/ui/spinner";
import { LinkedInButton } from "@/components/auth/LinkedInButton";
import { getLinkedInAuthUrl } from "@/lib/linkedinAuth";
import { LinkedInRoleModal } from "@/components/modals/LinkedInRoleModal";

export default function SignUpPage() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const signUpSchema = useMemo(() => getSignUpSchema(tv), [tv]);
  const [userRype, setUserRype] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [signup, { isLoading }] = useSignupMutation();

  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: undefined,
      password: "",
    },
  });

  const onSubmit = async (formData: SignUpFormData) => {
    setError("");
    try {
      const payload = {
        ...formData,
        userType: userRype,
        loginProvider: "email",
      } as unknown;

      // Call the signup mutation
      const userData = await signup(payload).unwrap();

      if (userData.success) {
        toast.success(t("signup.created"), {
          description: t("signup.createdDescription"),
        });

        form.reset();
        router.push(
          `/email-verification?email=${encodeURIComponent(
            formData.email
          )}&reason=account_verification`
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorSources?.[0]?.message ||
        t("signup.failed");
      setError(errorMessage);
      toast.error(
        error?.data?.errorSources?.[0]?.message || error?.data?.message || t("signup.failedTitle"),
        {
          description: t("signup.tryAgainLater"),
        }
      );
    }
  };

  const handleLinkedInSignup = () => {
    // Open the modal to select role
    setIsLinkedInModalOpen(true);
  };

  const handleLinkedInContinue = (role: string, userType: string) => {
    // Store role and userType for LinkedIn callback
    sessionStorage.setItem("linkedin_role", role);
    sessionStorage.setItem("linkedin_userType", userType);
    sessionStorage.setItem("linkedin_isSignup", "true");

    // Redirect to LinkedIn OAuth
    const authUrl = getLinkedInAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen md:flex relative">
      {/* Left side */}
      <div className="hidden flex-1 md:flex items-center justify-center px-2 md:px-5 lg:px-8 bg-primary">
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
            {t("signup.heroTitle")}
          </h2>
          <p className="text-[#837E5B] mt-1">
            {t("signup.heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-2 md:p-5 lg:p-8">
        <div className="w-full max-w-md bg-white border-2 rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t("signup.title")}
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

              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("fields.firstName")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t("fields.firstNamePlaceholder")}
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
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("fields.lastName")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t("fields.lastNamePlaceholder")}
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
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("fields.email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("fields.emailPlaceholder")}
                        className="bg-gray-100 border-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("fields.role")}
                    </FormLabel>
                    <FormControl>
                      <RoleSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        setUserRype={setUserRype}
                      />
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

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer bg-primary text-[#252525] hover:bg-amber-300 py-3 rounded-md"
              >
                {isLoading ? <Spinner className="h-4 w-4" /> : t("signup.submit")}
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

          {/* LinkedIn Signup Button */}
          <LinkedInButton
            onClick={handleLinkedInSignup}
            label={t("signup.linkedin")}
          />

          {/* LinkedIn Role Selection Modal */}
          <LinkedInRoleModal
            open={isLinkedInModalOpen}
            onOpenChange={setIsLinkedInModalOpen}
            onContinue={handleLinkedInContinue}
          />

          {/* Sign in link */}
          <div className="text-center text-sm text-gray-600 mt-4">
            {t.rich("signup.haveAccount", {
              link: (chunks) => (
                <Link
                  href="/signin"
                  className="underline text-primary-fill-primary"
                >
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
