"use client";

import { useState } from "react";

/** A stored value that may still be one string (older profiles) or a list. */
export const toList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v !== "") : typeof value === "string" && value ? [value] : [];

/**
 * Pick any number of options (for example the national team categories a player has played in).
 * Buttons that stay pressed; nothing selected is allowed.
 */
export default function MultiChipSelect({
  options,
  initial,
  labelFor,
  onChange,
}: {
  options: readonly string[];
  /** Selected values to start with (a single string from older profiles is fine). */
  initial?: unknown;
  labelFor: (option: string) => string;
  onChange: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(() => toList(initial));

  const toggle = (option: string) => {
    const next = selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option];
    setSelected(next);
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((option) => {
        const on = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(option)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              on ? "border-yellow-500 bg-yellow-100 font-medium text-gray-900" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
            }`}
          >
            {labelFor(option)}
          </button>
        );
      })}
    </div>
  );
}
