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
import { professionalPlayerProfessionalInfoSchema } from "@/shchemas/profileValidation";
import {
  availabilityOptions,
  countryList,
  divisionLevelOptions,
  footOptions,
  genderOptions,
  heightUnitOptions,
  playerPositionOptions,
  professionalPlayerNationalTeamCategoryOptions,
  weightUnitOptions,
} from "@/constants/selectOptions";
import { TProfessionalPlayerProfessionalInfo } from "@/types/profile";

interface IProfessionalPlayerProfessionalInfoFormProps {
  onNext: (data: TProfessionalPlayerProfessionalInfo) => void;
  onPrev: () => void;
  initialData?: Partial<TProfessionalPlayerProfessionalInfo>;
  steps?: Array<{
    id: number;
    label: string;
    completed?: boolean;
    active?: boolean;
  }>;
}

export function ProfessionalPlayerProfessionalInfoForm({
  onNext,
  onPrev,
  initialData,
  steps,
}: IProfessionalPlayerProfessionalInfoFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<TProfessionalPlayerProfessionalInfo>({
    resolver: zodResolver(professionalPlayerProfessionalInfoSchema),
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

  const onSubmit = (data: TProfessionalPlayerProfessionalInfo) => {
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
                    value as TProfessionalPlayerProfessionalInfo["gender"],
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
                    value as unknown as TProfessionalPlayerProfessionalInfo["availability"],
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
                      value as TProfessionalPlayerProfessionalInfo["height"]["unit"],
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
                      value as TProfessionalPlayerProfessionalInfo["weight"]["unit"],
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

            {/* Country */}
            <FormField label="Country" error={errors.country?.message}>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "country",
                    value as unknown as TProfessionalPlayerProfessionalInfo["country"],
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

            {/* Current Club */}
            <FormField label="Current club" error={errors.currentClub?.message}>
              <Input
                {...register("currentClub")}
                placeholder="Ex. Real Madrid"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* National Team Category */}
            <FormField
              label="National Team Category"
              error={errors.nationalTeamCategory?.message}
            >
              <Select
                onValueChange={(value) =>
                  setValue(
                    "nationalTeamCategory",
                    value as unknown as TProfessionalPlayerProfessionalInfo["nationalTeamCategory"],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {professionalPlayerNationalTeamCategoryOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* nationalTeamGames */}
            <FormField
              label="National Team Games"
              error={errors.nationalTeamGames?.message}
            >
              <Input
                {...register("nationalTeamGames")}
                placeholder="Ex. 10"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Foot */}
            <FormField label="Foot" error={errors.foot?.message}>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "foot",
                    value as unknown as TProfessionalPlayerProfessionalInfo["foot"],
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
                    value as unknown as TProfessionalPlayerProfessionalInfo["position"],
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

            {/* Division level */}
            <FormField
              label="Division Level"
              error={errors.nationalTeamGames?.message}
            >
              <Select onValueChange={(value) => setValue("division", value)}>
                <SelectTrigger className="bg-gray-50 border-0 w-full">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisionLevelOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Teams Joined */}
            <FormField
              label="Team's Joined"
              error={errors.teamsJoined?.message}
            >
              <Input
                {...register("teamsJoined")}
                placeholder="Your Joined details"
                className="bg-gray-50 bord er-0"
              />
            </FormField>

            {/* Agent */}
            <FormField
              label="Agent (if applicable)"
              error={errors.agent?.message}
            >
              <Input
                {...register("agent")}
                placeholder="Agent name"
                className="bg-gray-50 border-0"
              />
            </FormField>

            {/* Contract Expires */}
            <FormField
              label="Contract Expires"
              error={errors.contractExpires?.message}
            >
              <Input
                {...register("contractExpires")}
                placeholder="Contract expires"
                className="bg-gray-50 border-0"
              />
            </FormField>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
