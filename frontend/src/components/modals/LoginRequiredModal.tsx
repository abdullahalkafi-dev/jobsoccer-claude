import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  message = "Please log in to continue with this action.",
}: LoginRequiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="hover:scale-105"
          >
            Cancel
          </Button>
          <Button type="button" onClick={onLogin} className="hover:scale-105">
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
