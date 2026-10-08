import React from "react";
import { Check, X } from "lucide-react";

type PlanFeature = {
  label: string;
  included: boolean;
};

type PlanCardProps = {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: "Most popular" | "Free";
  highlight?: boolean;
  features: PlanFeature[];
};

const FeatureRow = ({ label, included }: PlanFeature) => (
  <li className="flex items-start gap-2 text-sm">
    <span
      className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full ${
        included ? "text-yellow-300" : "text-gray-400"
      }`}
    >
      {included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </span>
    <span className={included ? "text-gray-900" : "text-gray-400"}>
      {label}
    </span>
  </li>
);

const PlanCard = ({
  name,
  price,
  period,
  badge,
  highlight,
  features,
}: PlanCardProps) => (
  <div
    className={`relative rounded-xl border bg-white p-5 shadow-sm ${
      highlight ? "border-yellow-300 shadow-md" : "border-gray-200"
    }`}
  >
    {badge && (
      <div
        className={`-mt-2 mb-3 inline-flex w-full justify-center rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          badge === "Free"
            ? "bg-yellow-300 text-gray-500"
            : "bg-yellow-300 text-gray-900"
        }`}
      >
        {badge}
      </div>
    )}
    <div className="text-sm font-semibold text-gray-600">{name}</div>
    <div className="mt-1 flex items-end gap-1">
      <span className="text-3xl font-bold text-gray-900">{price}</span>
      <span className="pb-1 text-xs text-gray-500">{period}</span>
    </div>
    <div className="my-4 h-px bg-gray-200" />
    <ul className="space-y-2">
      {features.map((feature) => (
        <FeatureRow
          key={`${name}-${feature.label}`}
          label={feature.label}
          included={feature.included}
        />
      ))}
    </ul>
  </div>
);

export type { PlanCardProps, PlanFeature };
export { PlanCard };
