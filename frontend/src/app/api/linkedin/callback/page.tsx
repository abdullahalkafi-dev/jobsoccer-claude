"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getLinkedInProfile, verifyOAuthState } from "@/lib/linkedinAuth";
import { useLoginMutation } from "@/redux/features/auth/authApi";

export default function LinkedInCallbackPage() {
  const [error, setError] = useState<string>("");

  const [login] = useLoginMutation();

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleLinkedInCallback = async () => {
      let isSignup = false;

      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Check for errors from LinkedIn
        if (errorParam) {
          throw new Error(errorDescription || "LinkedIn authentication failed");
        }

        // Verify required parameters
        if (!code || !state) {
          throw new Error("Missing authorization code or state");
        }

        // Verify state to prevent CSRF attacks
        const stateValid = verifyOAuthState(state);
        if (!stateValid) {
          console.warn("State verification failed, but continuing...");
          // Don't throw error for now, as state might be lost in some browsers
        }

        // Exchange code for access token and get profile (server-side)
        const linkedInProfile = await getLinkedInProfile(code);

        // console.log("Profile received:", linkedInProfile);

        // Get role and userType from sessionStorage (set from signin/signup page)
        const role = sessionStorage.getItem("linkedin_role");
        const userType = sessionStorage.getItem("linkedin_userType");
        isSignup = sessionStorage.getItem("linkedin_isSignup") === "true";

        // Clean up session storage
        sessionStorage.removeItem("linkedin_role");
        sessionStorage.removeItem("linkedin_userType");
        sessionStorage.removeItem("linkedin_isSignup");

        // Prepare login payload
        const payload: {
          email: string;
          loginProvider: string;
          firstName?: string;
          lastName?: string;
          role?: string;
          userType?: string;
        } = {
          email: linkedInProfile.email,
          loginProvider: "linkedin",
        };

        // Add additional fields for new users
        if (isSignup && role && userType) {
          payload.firstName = linkedInProfile.firstName;
          payload.lastName = linkedInProfile.lastName;
          payload.role = role;
          payload.userType = userType;
        }

        // Login with backend
        const res = await login(payload).unwrap();

        if (res?.data?.accessToken) {
          toast.success("Welcome back!", {
            description: "You have successfully signed in with LinkedIn.",
          });

          // Navigate based on user profile status
          if (res.data.user?.profileId) {
            router.push("/");
          } else if (res.data.user?.userType === "employer") {
            router.push("/create-profile/employer");
          } else {
            router.push("/create-profile/candidate");
          }
        }
      } catch (error: unknown) {
        console.error("LinkedIn callback error:", error);
        const err = error as {
          data?: { message?: string };
          message?: string;
        };
        const errorMessage =
          err?.data?.message ||
          err?.message ||
          "LinkedIn authentication failed. Please try again.";

        // Check if account doesn't exist and this is a login attempt
        if (
          errorMessage === "Account does not exist. Please sign up first." &&
          !isSignup
        ) {
          router.push("/signup");

          toast.error("First create account with LinkedIn", {
            description: "Redirecting to signup...",
          });
          return;
        }

        setError(errorMessage);
        toast.error("Authentication failed", {
          description: errorMessage,
        });

        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      }
    };

    handleLinkedInCallback();
  }, [searchParams, router, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Authentication Error
            </h2>
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm mb-4">
              <p className="font-medium">Error</p>
              <p className="mt-1">{error}</p>
            </div>
            <p className="text-sm text-gray-600">
              Redirecting you to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authenticating with LinkedIn...
        </h2>
        <p className="text-sm text-gray-600">
          Please wait while we complete your sign in.
        </p>
      </div>
    </div>
  );
}
