import React from "react";
import { FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface LinkedInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export const LinkedInButton: React.FC<LinkedInButtonProps> = ({
  onClick,
  disabled = false,
  label = "Continue with LinkedIn",
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white py-3 rounded-md flex items-center justify-center gap-2"
    >
      <FaLinkedin className="h-5 w-5" />
      {label}
    </Button>
  );
};
