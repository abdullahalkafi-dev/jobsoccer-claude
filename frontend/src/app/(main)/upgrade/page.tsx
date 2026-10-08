"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { PlanCard, PlanCardProps } from "@/components/cards/PlanCard";

type PlanGroup = {
  label: string;
  plans: PlanCardProps[];
};

const pricingGroups: PlanGroup[] = [
  {
    label: "STAFF",
    plans: [
      {
        id: "staff-basic",
        name: "Basic plan",
        price: "$9.99",
        period: "/month",
        features: [
          { label: "Verified professional profile", included: true },
          { label: "Apply to open roles", included: true },
          { label: "Upload CV & certifications", included: true },
          { label: "Profile views tracker", included: true },
          { label: "Priority in recruiter searches", included: false },
          { label: "Advanced analytics dashboard", included: false },
        ],
      },
      {
        id: "staff-gold",
        name: "Gold plan",
        price: "$39.99",
        period: "/month",
        badge: "Most popular",
        highlight: true,
        features: [
          { label: "Everything in Basic", included: true },
          { label: "Priority in recruiter searches", included: true },
          { label: "Advanced analytics dashboard", included: true },
          { label: "Direct club & agent messaging", included: true },
          { label: "Webinars & career events access", included: true },
          { label: "AI profile optimization feedback", included: true },
        ],
      },
    ],
  },
  {
    label: "AMATEUR PLAYER",
    plans: [
      {
        id: "amateur-basic",
        name: "Basic plan",
        price: "$0",
        period: "/month",
        badge: "Free",
        features: [
          { label: "Create a public profile", included: true },
          { label: "Apply to amateur opportunities", included: true },
          { label: "Upload 1 highlight video", included: true },
          { label: "AI profile score & feedback", included: true },
          { label: "Priority visibility", included: false },
        ],
      },
      {
        id: "amateur-silver",
        name: "Silver plan",
        price: "$9.99",
        period: "/month",
        features: [
          { label: "Everything in Basic", included: true },
          { label: "Multiple video uploads", included: true },
          { label: "Profile views tracker", included: true },
          { label: "Job alerts & saved searches", included: true },
          { label: "AI-driven PRO score boost", included: false },
        ],
      },
      {
        id: "amateur-gold",
        name: "Gold plan",
        price: "$29.99",
        period: "/month",
        badge: "Most popular",
        highlight: true,
        features: [
          { label: "Everything in Silver", included: true },
          { label: "AI-driven PRO score boost", included: true },
          { label: "Personality & behavioral profile", included: true },
          { label: "Global exposure to clubs", included: true },
          { label: "Direct messaging with agents", included: true },
        ],
      },
    ],
  },
  {
    label: "PRO PLAYER",
    plans: [
      {
        id: "pro-basic",
        name: "Basic plan",
        price: "$9.99",
        period: "/month",
        features: [
          { label: "Verified pro profile", included: true },
          { label: "Apply to pro roles", included: true },
          { label: "CV & stats upload", included: true },
          { label: "Video session analysis", included: true },
          { label: "AI performance report", included: false },
        ],
      },
      {
        id: "pro-silver",
        name: "Silver plan",
        price: "$29.99",
        period: "/month",
        features: [
          { label: "Everything in Basic", included: true },
          { label: "Video session analysis", included: true },
          { label: "Shortlist & trial alerts", included: true },
          { label: "Network with clubs & agents", included: true },
          { label: "Spotlight placement", included: false },
        ],
      },
      {
        id: "pro-gold",
        name: "Gold plan",
        price: "$59.99",
        period: "/month",
        badge: "Most popular",
        highlight: true,
        features: [
          { label: "Everything in Silver", included: true },
          { label: "AI performance report", included: true },
          { label: "Spotlight placement", included: true },
          { label: "Psychometric profiling", included: true },
          { label: "Early access to premium jobs", included: true },
        ],
      },
    ],
  },
];

// ─── Employer pricing data ────────────────────────────────────────────────────

type EmployerType = {
  label: string;
  basicPrice: string;
  goldPrice: string;
};

const employerTypes: EmployerType[] = [
  { label: "Professional Clubs", basicPrice: "$19.99", goldPrice: "$59.99" },
  { label: "Amateur Clubs",      basicPrice: "$9.99",  goldPrice: "$29.99" },
  { label: "Academy",           basicPrice: "$9.99",  goldPrice: "$29.99" },
  { label: "College / University", basicPrice: "$19.99", goldPrice: "$59.99" },
  { label: "Consulting Company", basicPrice: "$19.99", goldPrice: "$59.99" },
  { label: "Agents / Agency",   basicPrice: "$19.99", goldPrice: "$59.99" },
];

const employerBasicFeatures = [
  { label: "Post up to 3 active job listings",     included: true  },
  { label: "Access candidate profiles & CVs",      included: true  },
  { label: "View pre-recorded video interviews",   included: true  },
  { label: "Organization profile page",            included: true  },
  { label: "AI candidate matching",                included: false },
  { label: "Hiring analytics dashboard",           included: false },
  { label: "Talent pool builder",                  included: false },
];

const employerGoldFeatures = [
  { label: "Everything in Basic",                      included: true },
  { label: "AI candidate matching & shortlists",       included: true },
  { label: "Hiring analytics dashboard",               included: true },
  { label: "Talent pool builder",                      included: true },
  { label: "Advanced search & psychometric filters",   included: true },
  { label: "Team collaboration tools",                 included: true },
  { label: "Unlimited job postings",                   included: true },
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
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl bg-yellow-300 py-3 text-center text-lg font-semibold shadow">
          Jobsoccer - Pricing Plans
        </div>

        {/* ── Candidates ── */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Candidates
          </h2>

          {pricingGroups.map((group) => (
            <section key={group.label} className="mt-5">
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
            Employers
          </h2>

          {/* Employer-type pricing grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {employerTypes.map((et) => (
              <div
                key={et.label}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{et.label}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Basic —{" "}
                    <span className="font-medium text-gray-700">{et.basicPrice}/mo</span>
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-300 px-4 py-2 text-right">
                  <p className="text-xs font-semibold ">Gold</p>
                  <p className="text-sm font-bold">{et.goldPrice}/mo</p>
                </div>
              </div>
            ))}
          </div>

          {/* Basic vs Gold feature comparison */}
          <div className="mt-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              What&apos;s Included — Basic vs Gold
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic column */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-gray-700">Basic plan</p>
                <ul className="space-y-2.5">
                  {employerBasicFeatures.map((f) => (
                    <FeatureItem key={f.label} label={f.label} included={f.included} />
                  ))}
                </ul>
              </div>

              {/* Gold column */}
              <div className="relative rounded-xl border-2 border-yellow-300 bg-white p-5 shadow-md">
                {/* Recommended banner */}
                <div className="mb-4 flex justify-center">
                  <h3 className="rounded-md w-full text-center bg-yellow-300 px-6 py-1 text-xs font-semibold uppercase tracking-wide shadow">
                    Recommended
                  </h3>
                </div>
                <p className="mb-4 text-sm font-semibold text-gray-700">Gold plan</p>
                <ul className="space-y-2.5">
                  {employerGoldFeatures.map((f) => (
                    <FeatureItem key={f.label} label={f.label} included={f.included} />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <p className="mt-6 text-center text-xs text-gray-400">
            All prices are per month &middot; Annual billing options available &middot; Prices in USD
          </p>
        </div>
      </div>
    </div>
  );
}
