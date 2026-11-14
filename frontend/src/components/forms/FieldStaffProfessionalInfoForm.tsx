"use client";

import React from "react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form/FormLayout";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFieldStaffProfessionalInfoSchema } from "@/schemas/profileValidation";
import { TFieldStaffProfessionalInfo } from "@/types/profile";
import {
  countryList,
  fieldStaffPositionOptions,
  genderOptions,
} from "@/constants/selectOptions";

interface IFieldStaffProfessionalInfoFormProps {
  onNext: (data: TFieldStaffProfessionalInfo) => void;
  onPrev: () => void;
  initialData?: Partial<TFieldStaffProfessionalInfo>;
  steps?: Array<{
    id: number;
    label: string;
    completed?: boolean;
    active?: boolean;
  }>;
}

export function FieldStaffProfessionalInfoForm({
  onNext,
  onPrev,
  initialData,
  steps,
}: IFieldStaffProfessionalInfoFormProps) {
  const t = useTranslations("forms");
  const tv = useTranslations("validation");
  const label = useOptionLabel();
  const schema = useMemo(() => getFieldStaffProfessionalInfoSchema(tv), [tv]);

  const {
    register,
    handleSubmit,
    setValue: rawSetValue,
    formState: { errors, isValid },
  } = useForm<TFieldStaffProfessionalInfo>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: "onChange",
  });

  // Re-check the form after a dropdown/photo changes, so "Next" enables as soon as everything is filled.
  const setValue: typeof rawSetValue = (name, value, options) =>
    rawSetValue(name, value, { shouldValidate: true, shouldDirty: true, ...options });

  const onSubmit = (data: TFieldStaffProfessionalInfo) => {
    onNext(data);
  };

  return (
    <FormLayout
      steps={steps}
      onNext={handleSubmit(onSubmit)}
      onPrev={onPrev}
      showPrev={true}
      isNextDisabled={!isValid}
    >
      <form className="space-y-8">
        <FormSection title={t("section.professionalInformation")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Employer */}
            <FormField
              label={t("label.currentEmployer")}
              error={errors.currentClub?.message}
            >
              <Input
                {...register("currentClub")}
                placeholder={t("placeholder.exRealMadrid")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Availability */}
            <FormField
              label={t("label.availableFromOptional")}
              error={errors.availability?.message}
            >
              <Input
                {...register("availability")}
                placeholder={t("placeholder.exImmediatelyOrJanuary2027")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Gender */}
            <FormField label={t("label.gender")} error={errors.gender?.message}>
              <Select defaultValue={initialData?.gender as string | undefined} onValueChange={(value) => setValue("gender", value)}>
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder={t("placeholder.selectGender")} />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {label("gender", item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Country */}
            <FormField label={t("label.country")} error={errors.country?.message}>
              <Select defaultValue={initialData?.country as string | undefined} onValueChange={(value) => setValue("country", value)}>
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder={t("placeholder.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((item) => (
                    <SelectItem key={item} value={item}>
                      {label("country", item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Agent */}
            <FormField
              label={t("label.agentIfApplicable")}
              error={errors.agent?.message}
            >
              <Input
                {...register("agent")}
                placeholder={t("placeholder.writeYourAgentSName")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Category */}
            <FormField
              label={t("label.categoryIfApplicable")}
              error={errors.category?.message}
            >
              <Input
                {...register("category")}
                placeholder={t("placeholder.writeYourCategory")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Category */}
            <FormField label={t("label.league")} error={errors.league?.message}>
              <Input
                {...register("league")}
                placeholder={t("placeholder.writeYourLeague")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Position */}
            <FormField
              label={t("label.selectYourPosition")}
              error={errors.position?.message}
            >
              <Select defaultValue={initialData?.position as string | undefined} onValueChange={(value) => setValue("position", value)}>
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder={t("placeholder.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {fieldStaffPositionOptions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {label("position", pos)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            
            {/* Social Media */}
            <FormField
              label={t("label.socialMediaOptional")}
              error={errors.socialMedia?.message}
            >
              <Input
                {...register("socialMedia")}
                placeholder={t("placeholder.httpsWwwExampleCom")}
                className="bg-gray-50 border-0"
              />
            </FormField>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
