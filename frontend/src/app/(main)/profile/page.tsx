"use client";

import React from "react";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("profile.page");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">{t("rootTitle")}</h1>
    </div>
  );
}
