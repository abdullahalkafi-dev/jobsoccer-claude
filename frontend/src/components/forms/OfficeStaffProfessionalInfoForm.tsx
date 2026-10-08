"use client";

import React from "react";
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
import { officeStaffProfessionalInfoSchema } from "@/shchemas/profileValidation";
import { TOfficeStaffProfessionalInfo } from "@/types/profile";
import {
  availabilityOptions,
  countryList,
  genderOptions,
  officeStaffPositionOptions,
} from "@/constants/selectOptions";

interface IOfficeStaffProfessionalInfoFormProps {
  onNext: (data: TOfficeStaffProfessionalInfo) => void;
  onPrev: () => void;
  initialData?: Partial<TOfficeStaffProfessionalInfo>;
  steps?: Array<{
    id: number;
    label: string;
    completed?: boolean;
    active?: boolean;
  }>;
}

export function OfficeStaffProfessionalInfoForm({
  onNext,
  onPrev,
  initialData,
  steps,
}: IOfficeStaffProfessionalInfoFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<TOfficeStaffProfessionalInfo>({
    resolver: zodResolver(officeStaffProfessionalInfoSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const onSubmit = (data: TOfficeStaffProfessionalInfo) => {
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
        <FormSection title="Professional Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Employer */}
            <FormField
              label="Current Employer"
              error={errors.currentClub?.message}
            >
              <Input
                {...register("currentClub")}
                placeholder="Ex. Real Madrid"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Gender */}
            <FormField label="Gender" error={errors.gender?.message}>
              <Select onValueChange={(value) => setValue("gender", value)}>
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Availability */}
            <FormField
              label="Availability (optional)"
              error={errors.availability?.message}
            >
              <Select
                onValueChange={(value) => setValue("availability", value)}
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Country */}
            <FormField label="Country" error={errors.country?.message}>
              <Select onValueChange={(value) => setValue("country", value)}>
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Agent */}
            <FormField
              label="Agent (if applicable)"
              error={errors.agent?.message}
            >
              <Input
                {...register("agent")}
                placeholder="Write your agent's name"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Position */}
            <FormField
              label="Select Your Position"
              error={errors.position?.message}
            >
              <Select onValueChange={(value) => setValue("position", value)}>
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {officeStaffPositionOptions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Languages */}
            <FormField label="Languages" error={errors.languages?.message}>
              <Input
                {...register("languages")}
                placeholder="Write your languages"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Social Media */}
            <FormField
              label="Social Media (optional)"
              error={errors.socialMedia?.message}
            >
              <Input
                {...register("socialMedia")}
                placeholder="https://www.example.com"
                className="bg-gray-50 border-0"
              />
            </FormField>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
