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
import { getAmateurPlayerProfessionalInfoSchema } from "@/schemas/profileValidation";
import type { TAmateurPlayerProfessionalInfo } from "@/types/profile";
import {
  amaturePlayerNationalTeamCategoryOptions,
  countryList,
  footOptions,
  genderOptions,
  heightUnitOptions,
  playerPositionOptions,
  weightUnitOptions,
} from "@/constants/selectOptions";

interface IAmateurPlayerProfessionalInfoFormProps {
  onNext: (data: TAmateurPlayerProfessionalInfo) => void;
  onPrev: () => void;
  initialData?: Partial<TAmateurPlayerProfessionalInfo>;
  steps?: Array<{
    id: number;
    label: string;
    completed?: boolean;
    active?: boolean;
  }>;
}

export function AmateurPlayerProfessionalInfoForm({
  onNext,
  onPrev,
  initialData,
  steps,
}: IAmateurPlayerProfessionalInfoFormProps) {
  const t = useTranslations("forms");
  const tv = useTranslations("validation");
  const label = useOptionLabel();
  const schema = useMemo(() => getAmateurPlayerProfessionalInfoSchema(tv), [tv]);

  const {
    register,
    handleSubmit,
    setValue: rawSetValue,
    formState: { errors, isValid },
  } = useForm<TAmateurPlayerProfessionalInfo>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
      height: {
        size: initialData?.height?.size,
        unit: initialData?.height?.unit ?? "ft",
      },
      weight: {
        size: initialData?.weight?.size,
        unit: initialData?.weight?.unit ?? "kg",
      },
    },
    mode: "onChange",
  });

  // Re-check the form after a dropdown/photo changes, so "Next" enables as soon as everything is filled.
  const setValue: typeof rawSetValue = (name, value, options) =>
    rawSetValue(name, value, { shouldValidate: true, shouldDirty: true, ...options });

  const onSubmit = (data: TAmateurPlayerProfessionalInfo) => {
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
            {/* Gender */}
            <FormField label={t("label.gender")} error={errors.gender?.message}>
              <Select
                defaultValue={initialData?.gender as string | undefined}
                onValueChange={(value) =>
                  setValue(
                    "gender" as const,
                    value as TAmateurPlayerProfessionalInfo["gender"],
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }
              >
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

            {/* Height */}
            <FormField label={t("label.height")} error={errors.height?.size?.message}>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="any"
                  {...register("height.size" as const, { valueAsNumber: true })}
                  placeholder={t("placeholder.ex57")}
                  className="bg-gray-50 border-0"
                />
                <Select
                  defaultValue={initialData?.height?.unit || "ft"}
                  onValueChange={(value) =>
                    setValue(
                      "height.unit" as const,
                      value as TAmateurPlayerProfessionalInfo["height"]["unit"],
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )
                  }
                >
                  <SelectTrigger className="w-20 bg-gray-50 border-0">
                    <SelectValue placeholder={t("placeholder.selectUnit")} />
                  </SelectTrigger>
                  <SelectContent>
                    {heightUnitOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {label("unit", item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormField>

            {/* Weight */}
            <FormField label={t("label.weight")} error={errors.weight?.size?.message}>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="any"
                  {...register("weight.size" as const, { valueAsNumber: true })}
                  placeholder={t("placeholder.ex75")}
                  className="bg-gray-50 border-0"
                />
                <Select
                  defaultValue={initialData?.weight?.unit || "kg"}
                  onValueChange={(value) =>
                    setValue(
                      "weight.unit" as const,
                      value as TAmateurPlayerProfessionalInfo["weight"]["unit"],
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )
                  }
                >
                  <SelectTrigger className="w-20 bg-gray-50 border-0">
                    <SelectValue placeholder={t("placeholder.selectUnit")} />
                  </SelectTrigger>
                  <SelectContent>
                    {weightUnitOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {label("unit", item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormField>

            {/* Current Club */}
            <FormField label={t("label.currentClub")} error={errors.currentClub?.message}>
              <Input
                {...register("currentClub")}
                placeholder={t("placeholder.exRealMadrid")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Country */}
            <FormField
              label={t("label.country")}
              error={errors.country?.message}
            >
              <Select
                defaultValue={initialData?.country as string | undefined}
                onValueChange={(value) =>
                  setValue(
                    "country",
                    value as unknown as TAmateurPlayerProfessionalInfo["country"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
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

            {/* National Team Category */}
            <FormField
              label={t("label.category")}
              error={errors.nationalTeamCategory?.message}
            >
              <Select
                defaultValue={initialData?.nationalTeamCategory as string | undefined}
                onValueChange={(value) =>
                  setValue(
                    "nationalTeamCategory",
                    value as unknown as TAmateurPlayerProfessionalInfo["nationalTeamCategory"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder={t("placeholder.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {amaturePlayerNationalTeamCategoryOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {label("category", item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Foot */}
            <FormField label={t("label.foot")} error={errors.foot?.message}>
              <Select
                defaultValue={initialData?.foot as string | undefined}
                onValueChange={(value) =>
                  setValue(
                    "foot",
                    value as unknown as TAmateurPlayerProfessionalInfo["foot"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder={t("placeholder.selectFoot")} />
                </SelectTrigger>
                <SelectContent>
                  {footOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {label("foot", item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Position */}
            <FormField label={t("label.position")} error={errors.position?.message}>
              <Select
                defaultValue={initialData?.position as string | undefined}
                onValueChange={(value) =>
                  setValue(
                    "position",
                    value as unknown as TAmateurPlayerProfessionalInfo["position"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder={t("placeholder.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {playerPositionOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {label("position", item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* League */}
            <FormField label={t("label.league")} error={errors.league?.message}>
              <Input
                {...register("league")}
                placeholder={t("placeholder.exPremierLeague")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Agent */}
            <FormField label={t("label.agentIfApplicable")} error={errors.agent?.message}>
              <Input
                {...register("agent")}
                placeholder={t("placeholder.exSumanBarman")}
                className="bg-gray-50 border-0"
              />
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
