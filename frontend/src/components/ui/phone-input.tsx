"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DIAL_COUNTRIES, flagOf, joinPhone, splitPhone } from "@/utils/countryDialCodes";

interface IPhoneInputProps {
  /** Stored as one text, e.g. "+33 786543641". */
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Accessible name of the country list. */
  countryLabel?: string;
  className?: string;
}

const defaultIso = (): string => {
  try {
    const region = navigator.language?.split("-")[1]?.toUpperCase();
    if (region && DIAL_COUNTRIES.some((c) => c.iso === region)) return region;
  } catch {
    /* no browser language: use the fallback */
  }
  return "US";
};

/** Country calling code list + number box. The two parts are saved together as "+code number". */
export function PhoneInput({ value = "", onChange, onBlur, placeholder, countryLabel = "Country code", className }: IPhoneInputProps) {
  const parsed = React.useMemo(() => splitPhone(value), [value]);
  const [iso, setIso] = React.useState<string>(parsed.country?.iso ?? "");
  const [national, setNational] = React.useState<string>(parsed.national);

  // Pick the visitor's country as the starting code when there is no stored code (old numbers have none).
  React.useEffect(() => {
    if (!iso && !value) setIso(defaultIso());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the form when it is reset or filled from saved data
  React.useEffect(() => {
    const current = joinPhone(DIAL_COUNTRIES.find((c) => c.iso === iso) ?? null, national);
    if (value !== current) {
      setIso(parsed.country?.iso ?? "");
      setNational(parsed.national);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (nextIso: string, nextNational: string) => {
    onChange(joinPhone(DIAL_COUNTRIES.find((c) => c.iso === nextIso) ?? null, nextNational));
  };

  const field = "h-10 rounded-md bg-gray-50 border-0 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={cn("flex gap-2", className)}>
      <select
        aria-label={countryLabel}
        value={iso}
        onChange={(e) => {
          setIso(e.target.value);
          emit(e.target.value, national);
        }}
        className={cn(field, "w-[8.5rem] shrink-0 truncate")}
      >
        {!iso && <option value="">+ ?</option>}
        {DIAL_COUNTRIES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {flagOf(c.iso)} +{c.dial} {c.name}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={national}
        placeholder={placeholder}
        onChange={(e) => {
          const text = e.target.value.replace(/[^\d\s().-]/g, "");
          setNational(text);
          emit(iso, text);
        }}
        onBlur={onBlur}
        className={cn(field, "min-w-0 flex-1")}
      />
    </div>
  );
}
