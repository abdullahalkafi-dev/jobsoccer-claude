"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface IFormFieldProps {
  label?: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  children,
  error,
  required,
  className = "",
  labelClassName = "",
}: IFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-sm font-medium text-gray-700", labelClassName)}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}