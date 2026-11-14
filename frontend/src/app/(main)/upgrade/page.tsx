"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { PlanCard, PlanCardProps } from "@/components/cards/PlanCard";

type PlanTier = "basic" | "silver" | "gold";

type PlanDef = {
  id: string;
  tier: PlanTier;
  price: number;
  badge?: "popular" | "free";
  highlight?: boolean;
  /** [feature key in upgrade.features, included] */
  features: [string, boolean][];
};

type PlanGroupDef = {
  key: "staff" | "amateur" | "pro";
  plans: PlanDef[];
};

const pricingGroups: PlanGroupDef[] = [
  {
    key: "staff",
    plans: [
      {
        id: "staff-basic",
        tier: "basic",
        price: 9.99,
        features: [
          ["verifiedProfile", true],
          ["applyRoles", true],
          ["uploadCv", true],
          ["profileViews", true],
          ["priorityRecruiter", false],
          ["advancedAnalytics", false],
        ],
      },
      {
        id: "staff-gold",
        tier: "gold",
        price: 39.99,
        badge: "popular",
        highlight: true,
        features: [
          ["everythingBasic", true],
          ["priorityRecruiter", true],
          ["advancedAnalytics", true],
          ["directMessaging", true],
          ["webinars", true],
          ["aiFeedback", true],
        ],
      },
    ],
  },
  {
    key: "amateur",
    plans: [
      {
        id: "amateur-basic",
        tier: "basic",
        price: 0,
        badge: "free",
        features: [
          ["publicProfile", true],
          ["applyAmateur", true],
          ["oneVideo", true],
          ["aiScore", true],
          ["priorityVisibility", false],
        ],
      },
      {
        id: "amateur-silver",
        tier: "silver",
        price: 9.99,
        features: [
          ["everythingBasic", true],
          ["multiVideo", true],
          ["profileViews", true],
          ["jobAlerts", true],
          ["proBoost", false],
        ],
      },
      {
        id: "amateur-gold",
        tier: "gold",
        price: 29.99,
        badge: "popular",
        highlight: true,
        features: [
          ["everythingSilver", true],
          ["proBoost", true],
          ["personality", true],
          ["globalExposure", true],
          ["agentMessaging", true],
        ],
      },
    ],
  },
  {
    key: "pro",
    plans: [
      {
        id: "pro-basic",
        tier: "basic",
        price: 9.99,
        features: [
          ["verifiedPro", true],
          ["applyPro", true],
          ["cvStats", true],
          ["videoAnalysis", true],
          ["aiReport", false],
        ],
      },
      {
        id: "pro-silver",
        tier: "silver",
        price: 29.99,
        features: [
          ["everythingBasic", true],
          ["videoAnalysis", true],
          ["shortlistAlerts", true],
          ["networkClubs", true],
          ["spotlight", false],
        ],
      },
      {
        id: "pro-gold",
        tier: "gold",
        price: 59.99,
        badge: "popular",
        highlight: true,
        features: [
          ["everythingSilver", true],
          ["aiReport", true],
          ["spotlight", true],
          ["psychometric", true],
          ["earlyAccess", true],
        ],
      },
    ],
  },
];

// ─── Employer pricing data ────────────────────────────────────────────────────

const employerTypes: { key: string; basicPrice: number; goldPrice: number }[] = [
  { key: "proClubs", basicPrice: 19.99, goldPrice: 59.99 },
  { key: "amateurClubs", basicPrice: 9.99, goldPrice: 29.99 },
  { key: "academy", basicPrice: 9.99, goldPrice: 29.99 },
  { key: "college", basicPrice: 19.99, goldPrice: 59.99 },
  { key: "consulting", basicPrice: 19.99, goldPrice: 59.99 },
  { key: "agents", basicPrice: 19.99, goldPrice: 59.99 },
];

const employerBasicFeatures: [string, boolean][] = [
  ["employerPost3", true],
  ["employerAccessProfiles", true],
  ["employerViewInterviews", true],
  ["employerOrgPage", true],
  ["employerAiMatching", false],
  ["employerAnalytics", false],
  ["employerTalentPool", false],
];

const employerGoldFeatures: [string, boolean][] = [
  ["everythingBasic", true],
  ["employerAiShortlists", true],
  ["employerAnalytics", true],
  ["employerTalentPool", true],
  ["employerAdvancedSearch", true],
  ["employerTeamTools", true],
  ["employerUnlimited", true],
];

// ─── Small helper ─────────────────────────────────────────────────────────────

const FeatureItem = ({ label, included }: { label: string; included: boolean }) => (
  <li className="flex items-start gap-2 text-sm">
    <span className={`mt-0.5 flex-shrink-0 ${included ? "text-yellow-300" : "text-red-400"}`}>
      {included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </span>
    <span className={included ? "text-gray-800" : "text-gray-400"}>{label}</span>
  </li>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  const t = useTranslations("upgrade");
  const format = useFormatter();
  // Plan prices have cents (9.99), so they are not rounded like the shared money() helper does
  const price = (value: number) =>
    format.number(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });

  const groups: { key: string; label: string; plans: PlanCardProps[] }[] = pricingGroups.map((group) => ({
    key: group.key,
    label: t(`groups.${group.key}`),
    plans: group.plans.map((plan) => ({
      id: plan.id,
      name: t(`planName.${plan.tier}`),
      price: price(plan.price),
      period: t("perMonth"),
      badge: plan.badge,
      highlight: plan.highlight,
      features: plan.features.map(([key, included]) => ({ label: t(`features.${key}`), included })),
    })),
  }));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl bg-yellow-300 py-3 text-center text-lg font-semibold shadow">
          {t("title")}
        </div>

        {/* ── Candidates ── */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {t("candidates")}
          </h2>

          {groups.map((group) => (
            <section key={group.key} className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {group.label}
              </h3>
              <div
                className={`mt-3 grid gap-4 ${
                  group.plans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
                }`}
              >
                {group.plans.map((plan) => (
                  <PlanCard key={plan.id} {...plan} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── Employers ── */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide">
            {t("employers")}
          </h2>

          {/* Employer-type pricing grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {employerTypes.map((et) => (
              <div
                key={et.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t(`employerTypes.${et.key}`)}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {t.rich("basicLine", {
                      price: price(et.basicPrice),
                      b: (chunks) => <span className="font-medium text-gray-700">{chunks}</span>,
                    })}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-300 px-4 py-2 text-right">
                  <p className="text-xs font-semibold ">{t("planName.goldShort")}</p>
                  <p className="text-sm font-bold">{t("perMonthShort", { price: price(et.goldPrice) })}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Basic vs Gold feature comparison */}
          <div className="mt-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              {t("comparison")}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic column */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-gray-700">{t("planName.basic")}</p>
                <ul className="space-y-2.5">
                  {employerBasicFeatures.map(([key, included]) => (
                    <FeatureItem key={key} label={t(`features.${key}`)} included={included} />
                  ))}
                </ul>
              </div>

              {/* Gold column */}
              <div className="relative rounded-xl border-2 border-yellow-300 bg-white p-5 shadow-md">
                {/* Recommended banner */}
                <div className="mb-4 flex justify-center">
                  <h3 className="rounded-md w-full text-center bg-yellow-300 px-6 py-1 text-xs font-semibold uppercase tracking-wide shadow">
                    {t("recommended")}
                  </h3>
                </div>
                <p className="mb-4 text-sm font-semibold text-gray-700">{t("planName.gold")}</p>
                <ul className="space-y-2.5">
                  {employerGoldFeatures.map(([key, included]) => (
                    <FeatureItem key={key} label={t(`features.${key}`)} included={included} />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <p className="mt-6 text-center text-xs text-gray-400">
            {t("footnote")}
          </p>
        </div>
      </div>
    </div>
  );
}
