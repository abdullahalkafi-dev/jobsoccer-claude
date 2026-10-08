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
    aiScoreLevel?: string;
    experience?: string;
  }) => void;
  onReset?: () => void;
  dateFilter?: string;
  aiScoreLevel?: string;
  experience?: string;
}

export function JobFilters({
  onFiltersChange,
  onReset,
  dateFilter: initialDateFilter,
  aiScoreLevel: initialAiScore,
  experience: initialExperience,
}: JobFiltersProps) {
  const [timeFilter, setTimeFilter] = useState(initialDateFilter || "");
  const [aiScoreFilter, setAiScoreFilter] = useState(initialAiScore || "");
  const [experienceFilter, setExperienceFilter] = useState(
    initialExperience || ""
  );

  const handleReset = () => {
    setTimeFilter("");
    setAiScoreFilter("");
    setExperienceFilter("");
    onReset?.();
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    onFiltersChange?.({
      dateFilter: value,
      aiScoreLevel: aiScoreFilter,
      experience: experienceFilter,
    });
  };

  const handleAiScoreChange = (value: string) => {
    setAiScoreFilter(value);
    onFiltersChange?.({
      dateFilter: timeFilter,
      aiScoreLevel: value,
      experience: experienceFilter,
    });
  };

  const handleExperienceChange = (value: string) => {
    setExperienceFilter(value);
    onFiltersChange?.({
      dateFilter: timeFilter,
      aiScoreLevel: value,
      experience: value,
    });
  };

  const timeOptions: FilterOption[] = [
    { label: "Last Week", value: "Last Week" },
    { label: "Last Month", value: "Last Month" },
    { label: "Last 3 Months", value: "Last 3 Months" },
    { label: "Last 6 Months", value: "Last 6 Months" },
  ];

  const aiScoreOptions: FilterOption[] = [
    { label: "Low (10% - 29%)", value: "Low" },
    { label: "Medium (30% - 59%)", value: "Medium" },
    { label: "Good (60% - 79%)", value: "Good" },
    { label: "High (80% - 100%)", value: "High" },
  ];

  const experienceOptions: FilterOption[] = [
    { label: "Entry Level", value: "Entry Level" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Mid-Level", value: "Mid-Level" },
    { label: "Mid-Senior", value: "Mid-Senior" },
    { label: "Senior", value: "Senior" },
  ];

  const hasActiveFilters = timeFilter || aiScoreFilter || experienceFilter;

  return (
    <div className="container mx-auto px-4 md:px-0 py-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FilterDropdown
          label="Posted Date"
          options={timeOptions}
          value={timeFilter}
          onValueChange={handleTimeFilterChange}
          isActive={!!timeFilter}
        />

        <FilterDropdown
          label="AI Score"
          options={aiScoreOptions}
          value={aiScoreFilter}
          onValueChange={handleAiScoreChange}
          isActive={!!aiScoreFilter}
        />

        <FilterDropdown
          label="Experience level"
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
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
