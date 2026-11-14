/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form/FormLayout";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import { ImageUpload } from "@/components/form/fields/ImageUpload";
import { Input } from "@/components/ui/input";
import { getPersonalInfoSchema } from "@/schemas/profileValidation";
import { TPersonalInfo } from "@/types/profile";

interface IPersonalInfoFormProps {
  onNext: (data: TPersonalInfo) => void;
  initialData?: Partial<TPersonalInfo>;
  steps?: Array<{
    id: number;
    label: string;
    completed?: boolean;
    active?: boolean;
  }>;
}

export function PersonalInfoForm({
  onNext,
  initialData,
  steps,
}: IPersonalInfoFormProps) {
  const t = useTranslations("forms");
  const tv = useTranslations("validation");
  const schema = useMemo(() => getPersonalInfoSchema(tv), [tv]);

  const {
    register,
    handleSubmit,
    setValue: rawSetValue,
    watch,
    formState: { errors, isValid },
  } = useForm<TPersonalInfo>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData,
    mode: "onChange",
  });

  const imageValue = watch("image");

  // Re-check the form after a dropdown/photo changes, so "Next" enables as soon as everything is filled.
  const setValue: typeof rawSetValue = (name, value, options) =>
    rawSetValue(name, value, { shouldValidate: true, shouldDirty: true, ...options });

  const onSubmit = (data: TPersonalInfo) => {
    onNext(data);
  };

  return (
    <FormLayout
      steps={steps}
      onNext={handleSubmit(onSubmit)}
      isNextDisabled={!isValid}
    >
      <form className="space-y-8">
        <FormSection title={t("section.personalInformation")}>
          <div className="flex justify-start mb-6">
            <FormField error={errors.image?.message}>
              {/* Profile Picture, Date of Birth, Place of Birth, Nationality, Phone Number (Optional) */}
              <ImageUpload
                value={imageValue}
                onChange={(file) => setValue("image", file as File)}
                placeholder={t("placeholder.uploadYourImage")}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label={t("label.dateOfBirth")}
              error={errors.dateOfBirth?.message}
            >
              <Input
                {...register("dateOfBirth")}
                type="date"
                className="bg-gray-50 border-0 flex-col"
              />
            </FormField>

            <FormField
              label={t("label.placeOfBirth")}
              error={errors.placeOfBirth?.message}
            >
              <Input
                {...register("placeOfBirth")}
                placeholder={t("placeholder.enterYourPlaceOfBirth")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            <FormField label={t("label.nationality")} error={errors.nationality?.message}>
              <Input
                {...register("nationality")}
                placeholder={t("placeholder.enterYourNationality")}
                className="bg-gray-50 border-0"
              />
            </FormField>

            <FormField
              label={t("label.phoneNumberOptional")}
              error={errors.phoneNumber?.message}
            >
              <Input
                {...register("phoneNumber")}
                placeholder={t("placeholder.enterYourPhoneNumber")}
                className="bg-gray-50 border-0"
              />
            </FormField>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
