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
import { amateurPlayerProfessionalInfoSchema } from "@/shchemas/profileValidation";
import type { TAmateurPlayerProfessionalInfo } from "@/types/profile";
import {
  amaturePlayerNationalTeamCategoryOptions,
  availabilityOptions,
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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<TAmateurPlayerProfessionalInfo>({
    resolver: zodResolver(amateurPlayerProfessionalInfoSchema),
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

  const onSubmit = (data: TAmateurPlayerProfessionalInfo) => {
    console.log("Amateur Player Professional Info:", data);

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
            {/* Gender */}
            <FormField label="Gender" error={errors.gender?.message}>
              <Select
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
                onValueChange={(value) =>
                  setValue(
                    "availability",
                    value as unknown as TAmateurPlayerProfessionalInfo["availability"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
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

            {/* Height */}
            <FormField label="Height" error={errors.height?.size?.message}>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="any"
                  {...register("height.size" as const, { valueAsNumber: true })}
                  placeholder="Ex. 5.7"
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
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {heightUnitOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormField>

            {/* Weight */}
            <FormField label="Weight" error={errors.weight?.size?.message}>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="any"
                  {...register("weight.size" as const, { valueAsNumber: true })}
                  placeholder="Ex. 75"
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
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {weightUnitOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormField>

            {/* Current Club */}
            <FormField label="Current club" error={errors.currentClub?.message}>
              <Input
                {...register("currentClub")}
                placeholder="Ex. Real Madrid"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Country */}
            <FormField
              label="Country"
              error={errors.country?.message}
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "country",
                    value as unknown as TAmateurPlayerProfessionalInfo["country"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
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

            {/* National Team Category */}
            <FormField
              label="Category"
              error={errors.nationalTeamCategory?.message}
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "nationalTeamCategory",
                    value as unknown as TAmateurPlayerProfessionalInfo["nationalTeamCategory"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {amaturePlayerNationalTeamCategoryOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Foot */}
            <FormField label="Foot" error={errors.foot?.message}>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "foot",
                    value as unknown as TAmateurPlayerProfessionalInfo["foot"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select foot" />
                </SelectTrigger>
                <SelectContent>
                  {footOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Position */}
            <FormField label="Position" error={errors.position?.message}>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "position",
                    value as unknown as TAmateurPlayerProfessionalInfo["position"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {playerPositionOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* League */}
            <FormField label="League" error={errors.league?.message}>
              <Input
                {...register("league")}
                placeholder="Ex. Premier League"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Agent */}
            <FormField label="Agent (if applicable)" error={errors.agent?.message}>
              <Input
                {...register("agent")}
                placeholder="Ex. Suman Barman"
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
