"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown } from "lucide-react";
import { CandidateRole, EmployerRole } from "@/types/profile";

const candidateRoles = Object.values(CandidateRole).filter(
  (value) => typeof value === "string"
) as string[];
const employerRoles = Object.values(EmployerRole).filter(
  (value) => typeof value === "string"
) as string[];

interface RoleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  setUserRype: (value: string) => void;
}

export default function RoleSelect({
  value,
  onValueChange,
  setUserRype,
}: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedRole(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCandidateRoleSelect = (role: string) => {
    setSelectedRole(role);
    onValueChange?.(role);

    try {
      setUserRype("candidate");
    } catch {
      // If caller didn't pass a setter or it throws, ignore silently
    }

    setOpen(false);
  };

  const handleEmployerRoleSelect = (role: string) => {
    setSelectedRole(role);
    onValueChange?.(role);

    try {
      setUserRype("employer");
    } catch {
      // If caller didn't pass a setter or it throws, ignore silently
    }

    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between text-left font-normal bg-gray-100 border-gray-200"
        onClick={() => setOpen(!open)}
      >
        {selectedRole || "Select role"}
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border-2 rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Candidates Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Candidates</h3>
              <RadioGroup
                value={selectedRole}
                onValueChange={handleCandidateRoleSelect}
              >
                {candidateRoles.map((role) => (
                  <div
                    key={`candidate-${role}`}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={role}
                      id={`candidate-${role}`}
                      className="border-gray-300 text-blue-600"
                    />
                    <Label
                      htmlFor={`candidate-${role}`}
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
                onValueChange={handleEmployerRoleSelect}
              >
                {employerRoles.map((role) => (
                  <div
                    key={`employer-${role}`}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={role}
                      id={`employer-${role}`}
                      className="border-gray-300 text-blue-600"
                    />
                    <Label
                      htmlFor={`employer-${role}`}
                      className="text-gray-700 cursor-pointer font-normal"
                    >
                      {role}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
