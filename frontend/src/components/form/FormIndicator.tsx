"use client";

import React from "react";
import { Check } from "lucide-react";

interface IStep {
  id: number;
  label: string;
  completed?: boolean;
  active?: boolean;
}

interface IStepIndicatorProps {
  steps: IStep[];
}

export function StepIndicator({ steps }: IStepIndicatorProps) {
  return (
    <div className="flex items-center border rounded-3xl px-8 py-6 w-full">
      <div className="flex items-center w-full justify-between space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  step.completed
                    ? "bg-blue-500 border-blue-500 text-white"
                    : step.active
                    ? "text-blue-500 border-blue-500 bg-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 ${
                  step.completed ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
