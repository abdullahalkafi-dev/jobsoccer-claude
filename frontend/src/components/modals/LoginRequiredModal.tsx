"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  message?: string;
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
  message,
}: LoginRequiredModalProps) {
  const t = useTranslations("common");
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("loginRequired.title")}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {message ?? t("loginRequired.message")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="hover:scale-105"
          >
            {t("ui.cancel")}
          </Button>
          <Button type="button" onClick={onLogin} className="hover:scale-105">
            {t("loginRequired.login")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
