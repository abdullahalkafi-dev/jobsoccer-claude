/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form/FormLayout";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import { ImageUpload } from "@/components/form/fields/ImageUpload";
import { Input } from "@/components/ui/input";
import { personalInfoSchema } from "@/shchemas/profileValidation";
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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<TPersonalInfo>({
    resolver: zodResolver(personalInfoSchema) as any,
    defaultValues: initialData,
    mode: "onChange",
  });

  const imageValue = watch("image");

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
        <FormSection title="Personal Information">
          <div className="flex justify-start mb-6">
            <FormField error={errors.image?.message}>
              {/* Profile Picture, Date of Birth, Place of Birth, Nationality, Phone Number (Optional) */}
              <ImageUpload
                value={imageValue}
                onChange={(file) => setValue("image", file as File)}
                placeholder="Upload your image"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Date of birth"
              error={errors.dateOfBirth?.message}
            >
              <Input
                {...register("dateOfBirth")}
                type="date"
                className="bg-gray-50 border-0 flex-col"
              />
            </FormField>

            <FormField
              label="Place Of Birth"
              error={errors.placeOfBirth?.message}
            >
              <Input
                {...register("placeOfBirth")}
                placeholder="Enter your place of birth"
                className="bg-gray-50 border-0"
              />
            </FormField>

            <FormField label="Nationality" error={errors.nationality?.message}>
              <Input
                {...register("nationality")}
                placeholder="Enter your nationality"
                className="bg-gray-50 border-0"
              />
            </FormField>

            <FormField
              label="Phone number (optional)"
              error={errors.phoneNumber?.message}
            >
              <Input
                {...register("phoneNumber")}
                placeholder="Enter your phone number"
                className="bg-gray-50 border-0"
              />
            </FormField>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
