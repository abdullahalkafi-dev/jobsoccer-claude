"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CandidateRole, EmployerRole } from "@/types/profile";

const candidateRoles = Object.values(CandidateRole).filter(
  (value) => typeof value === "string"
) as string[];
const employerRoles = Object.values(EmployerRole).filter(
  (value) => typeof value === "string"
) as string[];

interface LinkedInRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (role: string, userType: string) => void;
}

export function LinkedInRoleModal({
  open,
  onOpenChange,
  onContinue,
}: LinkedInRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [userType, setUserType] = useState<string>("");

  const handleRoleSelect = (role: string, type: string) => {
    setSelectedRole(role);
    setUserType(type);
  };

  const handleContinue = () => {
    if (selectedRole && userType) {
      onContinue(selectedRole, userType);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
          <DialogDescription>
            Please select your role to continue with LinkedIn sign up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Candidates Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Candidates</h3>
            <RadioGroup
              value={selectedRole}
              onValueChange={(role) => handleRoleSelect(role, "candidate")}
            >
              {candidateRoles.map((role) => (
                <div
                  key={`candidate-${role}`}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={role}
                    id={`modal-candidate-${role}`}
                    className="border-gray-300 text-blue-600"
                  />
                  <Label
                    htmlFor={`modal-candidate-${role}`}
                    className="text-gray-700 cursor-pointer font-normal"
                  >
                    {role}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Employers Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Employers</h3>
            <RadioGroup
              value={selectedRole}
              onValueChange={(role) => handleRoleSelect(role, "employer")}
            >
              {employerRoles.map((role) => (
                <div
                  key={`employer-${role}`}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={role}
                    id={`modal-employer-${role}`}
                    className="border-gray-300 text-blue-600"
                  />
                  <Label
                    htmlFor={`modal-employer-${role}`}
                    className="text-gray-700 cursor-pointer font-normal"
                  >
                    {role}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || !userType}
            type="button"
            className="bg-primary text-[#252525] hover:bg-amber-300"
          >
            Continue with LinkedIn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
