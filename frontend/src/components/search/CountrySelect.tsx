"use client";

import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { countryList } from "@/constants/selectOptions";
import { useOptionLabel } from "@/i18n/options";
import { sortByLabel } from "@/i18n/sort";

const ANY = "__any__";

/** Country filter used by the search bars. The value sent to the API is the English country name. */
export function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("jobs.search");
  const label = useOptionLabel();
  const locale = useLocale();
  const countries = sortByLabel([...countryList], (c) => label("country", c), locale);

  return (
    <div className="relative w-full lg:w-64 border md:border-0 rounded-lg">
      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
      <Select
        value={value}
        onValueChange={(v) => onChange(v === ANY ? "" : v)}
      >
        <SelectTrigger className="w-full h-12 pl-12 border-none shadow-none bg-transparent text-gray-700 focus-visible:ring-0">
          <SelectValue placeholder={t("location")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ANY}>{t("anyCountry")}</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {label("country", country)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
