/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form/FormLayout";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCollegeOrUniversityEmployerProfileSchema } from "@/schemas/profileValidation";
import { TCollegeOrUniversityEmployerProfile } from "@/types/profile";
import { countryList } from "@/constants/selectOptions";
import { z } from "zod";

type CollegeOrUniversityEmployerProfileFormData = z.input<
  ReturnType<typeof getCollegeOrUniversityEmployerProfileSchema>
>;

interface ICollegeOrUniversityEmployerProfileFormProps {
  onNext: (data: TCollegeOrUniversityEmployerProfile) => void;
  onPrev?: () => void;
  initialData?: Partial<CollegeOrUniversityEmployerProfileFormData>;
  isLoading?: boolean;
}

export function CollegeOrUniversityEmployerProfileForm({
  onNext,
  onPrev,
  initialData,
  isLoading,
}: ICollegeOrUniversityEmployerProfileFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const t = useTranslations("forms");
  const tv = useTranslations("validation");
  const label = useOptionLabel();
  const schema = useMemo(() => getCollegeOrUniversityEmployerProfileSchema(tv), [tv]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollegeOrUniversityEmployerProfileFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: CollegeOrUniversityEmployerProfileFormData) => {
    onNext(data as any);
  };

  return (
    <FormLayout
      onNext={handleSubmit(onSubmit)}
      onPrev={onPrev}
      showPrev={false}
      nextLabel={t("button.complete")}
      isLoading={isLoading}
    >
      <form className="space-y-8">
        <FormSection title={t("section.collegeUniversityInformation")}>
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt={t("alt.logoPreview")}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">{t("logo.upload")}</span>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <span className="text-sm hover:underline">
                  {t("logo.uploadHint")}
                </span>
              </label>
              {errors.logo && (
                <p className="text-sm text-red-500">{errors.logo.message}</p>
              )}
            </div>

            {/* Country and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* College/University Name */}
              <FormField
                label={t("label.collegeUniversityName")}
                error={errors.collegeOrUniversityName?.message}
              >
                <Input
                  {...register("collegeOrUniversityName")}
                  placeholder={t("placeholder.nameOfCollegeOrUniversity")}
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField label={t("label.country")} error={errors.country?.message}>
                <Select
                  onValueChange={(value) =>
                    setValue("country", value, { shouldValidate: true })
                  }
                  defaultValue={initialData?.country}
                >
                  <SelectTrigger className="bg-gray-50 border-0 w-full">
                    <SelectValue placeholder={t("placeholder.selectCountry")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((country) => (
                      <SelectItem key={country} value={country}>
                        {label("country", country)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t("label.location")} error={errors.location?.message}>
                <Input
                  {...register("location")}
                  placeholder={t("placeholder.writeYourLocation")}
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField label={t("label.address")} error={errors.address?.message}>
                <Input
                  {...register("address")}
                  placeholder={t("placeholder.writeYourAddress")}
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField label={t("label.level")} error={errors.level?.message}>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      "level",
                      value as
                        | "Division 1"
                        | "Division 2"
                        | "Division 3"
                        | "Division 4",
                      {
                        shouldValidate: true,
                      }
                    )
                  }
                  defaultValue={initialData?.level}
                >
                  <SelectTrigger className="bg-gray-50 border-0 w-full">
                    <SelectValue placeholder={t("placeholder.selectDivision")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Division 1">Division 1</SelectItem>
                    <SelectItem value="Division 2">Division 2</SelectItem>
                    <SelectItem value="Division 3">Division 3</SelectItem>
                    <SelectItem value="Division 4">Division 4</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t("label.founded")} error={errors.founded?.message}>
                <DatePicker
                  value={watch("founded")}
                  onChange={(v) => setValue("founded", v, { shouldValidate: true })}
                  aria-invalid={!!errors.founded}
                  className="bg-gray-50 border-0 hover:bg-gray-50"
                />
              </FormField>

              <FormField label={t("label.website")} error={errors.website?.message}>
                <Input
                  {...register("website")}
                  placeholder={t("placeholder.websiteUrl")}
                  className="bg-gray-50 border-0"
                />
              </FormField>

              {/* Phone Number */}
              <FormField
                label={t("label.phoneNumber")}
                error={errors.phoneNumber?.message}
              >
                <Input
                  {...register("phoneNumber")}
                  placeholder={t("placeholder.0000000000")}
                  className="bg-gray-50 border-0"
                />
              </FormField>

              {/* Club Contact (name and position) */}
              <FormField
                label={t("label.clubSContactNameAndPosition")}
                error={errors.clubContact?.message}
              >
                <Input
                  {...register("clubContact")}
                  placeholder={t("placeholder.exJohnDoeDirectorOfAthletics")}
                  className="bg-gray-50 border-0 w-full"
                />
              </FormField>
            </div>
            {/* Short paragraph describing the institution */}
            <FormField
              label={t("label.shortParagraphDescribingTheInstitution")}
              error={errors.clubDescription?.message}
            >
              <Textarea
                {...register("clubDescription")}
                placeholder={t("placeholder.writeAShortDescriptionAboutTheInstitution")}
                className="bg-gray-50 border-0 min-h-[100px]"
              />
            </FormField>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
