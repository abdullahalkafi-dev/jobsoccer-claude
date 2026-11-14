"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  isActive?: boolean;
}

function FilterDropdown({
  label,
  options,
  value,
  onValueChange,
  isActive,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between gap-3 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-[140px]",
            isActive || value
              ? "bg-[#5D4E37] text-white hover:bg-[#6B5B3A]"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
        >
          <span>
            {value
              ? options.find((opt) => opt.value === value)?.label || label
              : label}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface JobFiltersProps {
  onFiltersChange?: (filters: {
    dateFilter?: string;
    premium?: string;
    experience?: string;
  }) => void;
  onReset?: () => void;
  dateFilter?: string;
  premium?: string;
  experience?: string;
}

export function JobFilters({
  onFiltersChange,
  onReset,
  dateFilter: initialDateFilter,
  premium: initialPremium,
  experience: initialExperience,
}: JobFiltersProps) {
  const t = useTranslations("jobs.filters");
  const label = useOptionLabel();
  const [timeFilter, setTimeFilter] = useState(initialDateFilter || "");
  const [opportunityFilter, setOpportunityFilter] = useState(initialPremium || "");
  const [experienceFilter, setExperienceFilter] = useState(
    initialExperience || ""
  );

  const handleReset = () => {
    setTimeFilter("");
    setOpportunityFilter("");
    setExperienceFilter("");
    onReset?.();
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    onFiltersChange?.({
      dateFilter: value,
      premium: opportunityFilter,
      experience: experienceFilter,
    });
  };

  const handleOpportunityChange = (value: string) => {
    setOpportunityFilter(value);
    onFiltersChange?.({
      dateFilter: timeFilter,
      premium: value,
      experience: experienceFilter,
    });
  };

  const handleExperienceChange = (value: string) => {
    setExperienceFilter(value);
    onFiltersChange?.({
      dateFilter: timeFilter,
      premium: opportunityFilter,
      experience: value,
    });
  };

  const timeOptions: FilterOption[] = [
    { label: label("postedDate", "Last Week"), value: "Last Week" },
    { label: label("postedDate", "Last Month"), value: "Last Month" },
    { label: label("postedDate", "Last 3 Months"), value: "Last 3 Months" },
    { label: label("postedDate", "Last 6 Months"), value: "Last 6 Months" },
  ];

  const opportunityOptions: FilterOption[] = [
    { label: t("premiumOpportunities"), value: "true" },
    { label: t("standardJobs"), value: "false" },
  ];

  const experienceOptions: FilterOption[] = [
    { label: label("experience", "Entry Level"), value: "Entry Level" },
    { label: label("experience", "Intermediate"), value: "Intermediate" },
    { label: label("experience", "Mid-Level"), value: "Mid-Level" },
    { label: label("experience", "Mid-Senior"), value: "Mid-Senior" },
    { label: label("experience", "Senior"), value: "Senior" },
  ];

  const hasActiveFilters = timeFilter || opportunityFilter || experienceFilter;

  return (
    <div className="container mx-auto px-4 md:px-0 py-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FilterDropdown
          label={t("postedDate")}
          options={timeOptions}
          value={timeFilter}
          onValueChange={handleTimeFilterChange}
          isActive={!!timeFilter}
        />

        <FilterDropdown
          label={t("opportunity")}
          options={opportunityOptions}
          value={opportunityFilter}
          onValueChange={handleOpportunityChange}
          isActive={!!opportunityFilter}
        />

        <FilterDropdown
          label={t("experienceLevel")}
          options={experienceOptions}
          value={experienceFilter}
          onValueChange={handleExperienceChange}
          isActive={!!experienceFilter}
        />

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t("reset")}
          </button>
        )}
      </div>
    </div>
  );
}
