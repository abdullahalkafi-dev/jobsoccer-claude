"use client";

import { LogOut, X, LucideIcon } from "lucide-react";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  confirmButtonClassName?: string;
  variant?: "danger" | "warning" | "info";
}

export default function LogoutModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Logout Confirmation",
  description = "Are you sure you want to logout? You'll need to sign in again to access your account.",
  confirmText = "Yes, Logout",
  cancelText = "Cancel",
  icon: Icon = LogOut,
  iconClassName,
  iconBgClassName,
  confirmButtonClassName,
  variant = "danger",
}: ConfirmationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key press
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onCancel();
      }
    },
    [isOpen, onCancel]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleEscapeKey]);

  if (!isOpen) return null;

  // Variant-based styling
  const variantStyles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      confirmButton: "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30",
    },
    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      confirmButton:
        "bg-yellow-600 hover:bg-yellow-700 shadow-lg shadow-yellow-600/30",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      confirmButton:
        "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg p-1"
          aria-label="Close modal"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={cn(
              "rounded-full p-4 animate-in zoom-in duration-300",
              iconBgClassName || currentVariant.iconBg
            )}
          >
            <Icon
              className={cn(
                "h-8 w-8",
                iconClassName || currentVariant.iconColor
              )}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2
            id="modal-title"
            className="text-2xl font-bold text-gray-900 mb-3"
          >
            {title}
          </h2>
          <p id="modal-description" className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            size="default"
            className="flex-1"
            type="button"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            size="default"
            className={cn("flex-1", confirmButtonClassName)}
            type="button"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
