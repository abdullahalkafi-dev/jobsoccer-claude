"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAccess: () => void;
  isLoading?: boolean;
}

export default function AccessRequestModal({
  isOpen,
  onClose,
  onRequestAccess,
  isLoading = false,
}: AccessRequestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Access Request
          </DialogTitle>
          <DialogDescription className="text-gray-600 pt-3 text-center">
            To view more details about the user, you need to connect with them
            first
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 flex-col sm:flex-row mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onRequestAccess}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              "Request Access"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
