"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "@/components/form/FormIndicator";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";

interface IFormLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  showNext?: boolean;
  showPrev?: boolean;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
  isLoading?: boolean;
  steps?: Array<{
    id: number;
    label: string;
    completed?: boolean;
    active?: boolean;
  }>;
  className?: string;
}

export function FormLayout({
  title,
  subtitle,
  children,
  onNext,
  onPrev,
  nextLabel,
  prevLabel,
  showNext = true,
  showPrev = false,
  isNextDisabled = false,
  isPrevDisabled = false,
  isLoading = false,
  steps,
  className = "",
}: IFormLayoutProps) {
  const t = useTranslations("forms");
  return (
    <div className={`min-h-screen bg-gray-50 pt-16 p-4 ${className}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title ?? t("layout.title")}</h1>
          <p className="text-gray-600 text-sm">{subtitle ?? t("layout.subtitle")}</p>
        </div>

        {/* Step Indicator */}
        {steps && steps.length > 0 && (
          <div className="mb-8">
            <StepIndicator steps={steps} />
          </div>
        )}

        {/* Form Content */}
        <Card className="bg-white shadow-sm border-0 rounded-lg">
          <CardContent className="p-8">{children}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <div>
            {showPrev && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
                disabled={isPrevDisabled}
                className="px-6"
              >
                {prevLabel ?? t("layout.previous")}
              </Button>
            )}
          </div>
          <div>
            {showNext && (
              <Button
                type="button"
                onClick={onNext}
                disabled={isNextDisabled || isLoading}
                className="min-w-[100px] bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-md font-medium"
              >
                {isLoading ? <Spinner className="h-4 w-4" /> : (nextLabel ?? t("layout.next"))}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
