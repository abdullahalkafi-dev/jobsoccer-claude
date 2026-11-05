"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSaveVideoConsentMutation } from "./videoApi";
import type { TVideoStatus } from "./types";

/**
 * The two confirmations the client asked for before any upload:
 * the AI notice, and permission to film other people (players, parents of under-18s).
 * Ticking a box saves it right away, so the server already has it when the upload starts.
 */
export function ConsentChecklist({ status }: { status: TVideoStatus }) {
  const [saveConsent, { isLoading }] = useSaveVideoConsentMutation();
  const { consent } = status.plan;
  const given = status.consent;

  const items = [
    consent.ai.required && { key: "ai" as const, text: consent.ai.text, checked: !!given.aiAt },
    consent.players.required && { key: "players" as const, text: consent.players.text, checked: !!given.playersAt },
  ].filter(Boolean) as { key: "ai" | "players"; text: string; checked: boolean }[];

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Before you upload</h3>
      {items.map((item) => (
        <div key={item.key} className="flex items-start gap-3">
          <Checkbox
            id={`consent-${item.key}`}
            checked={item.checked}
            disabled={item.checked || isLoading}
            onCheckedChange={(value) => value === true && saveConsent({ [item.key]: true })}
            className="mt-1"
          />
          <Label htmlFor={`consent-${item.key}`} className="text-sm font-normal leading-snug text-gray-700">
            {item.text}
          </Label>
        </div>
      ))}
    </div>
  );
}
