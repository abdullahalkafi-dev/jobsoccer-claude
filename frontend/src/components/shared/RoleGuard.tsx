"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

/**
 * Keeps a candidate out of employer-only pages and an employer out of candidate-only pages.
 * Someone on the wrong side is sent to their own profile; nothing is shown in the meantime.
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: "candidate" | "employer";
  children: React.ReactNode;
}) {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const userType = user?.userType;
  const wrongSide = !!userType && userType !== allow;

  useEffect(() => {
    if (wrongSide) {
      router.replace(userType === "employer" ? "/profile/employer" : "/profile/candidate");
    }
  }, [wrongSide, userType, router]);

  if (wrongSide) return null;
  return <>{children}</>;
}
