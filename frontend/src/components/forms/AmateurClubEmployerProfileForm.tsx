/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form/FormLayout";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { amateurClubEmployerProfileSchema } from "@/shchemas/profileValidation";
import { TAmateurClubEmployerProfile } from "@/types/profile";
import { countryList } from "@/constants/selectOptions";
import { z } from "zod";

type AmateurClubEmployerProfileFormData = z.input<
  typeof amateurClubEmployerProfileSchema
>;

interface IAmateurClubEmployerProfileFormProps {
  onNext: (data: TAmateurClubEmployerProfile) => void;
  onPrev?: () => void;
  initialData?: Partial<AmateurClubEmployerProfileFormData>;
  isLoading?: boolean;
}

export function AmateurClubEmployerProfileForm({
  onNext,
  onPrev,
  initialData,
  isLoading,
}: IAmateurClubEmployerProfileFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AmateurClubEmployerProfileFormData>({
    resolver: zodResolver(amateurClubEmployerProfileSchema) as any,
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

  const onSubmit = (data: AmateurClubEmployerProfileFormData) => {
    onNext(data as any);
  };

  return (
    <FormLayout
      onNext={handleSubmit(onSubmit)}
      onPrev={onPrev}
      showPrev={false}
      nextLabel="Complete"
      isLoading={isLoading}
    >
      <form className="space-y-8">
        <FormSection title="Club Information">
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Upload Logo</span>
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
                  Upload your Logo (Max 10mb)
                </span>
              </label>
              {errors.logo && (
                <p className="text-sm text-red-500">{errors.logo.message}</p>
              )}
            </div>

            {/* Country and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Club Name */}
              <FormField label="Club name" error={errors.clubName?.message}>
                <Input
                  {...register("clubName")}
                  placeholder="Name of club"
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField label="Country" error={errors.country?.message}>
                <Select
                  onValueChange={(value) =>
                    setValue("country", value, { shouldValidate: true })
                  }
                  defaultValue={initialData?.country}
                >
                  <SelectTrigger className="bg-gray-50 border-0 w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Address" error={errors.address?.message}>
                <Input
                  {...register("address")}
                  placeholder="Write your address"
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField label="Level" error={errors.level?.message}>
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
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Division 1">Division 1</SelectItem>
                    <SelectItem value="Division 2">Division 2</SelectItem>
                    <SelectItem value="Division 3">Division 3</SelectItem>
                    <SelectItem value="Division 4">Division 4</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Location" error={errors.location?.message}>
                <Input
                  {...register("location")}
                  placeholder="Write your location"
                  className="bg-gray-50 border-0"
                />
              </FormField>

              {/* Founded and Website */}
              <FormField label="Founded" error={errors.founded?.message}>
                <Input
                  type="date"
                  {...register("founded")}
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField label="Website" error={errors.website?.message}>
                <Input
                  {...register("website")}
                  placeholder="Website URL"
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField
                label="Nationality"
                error={errors.nationality?.message}
              >
                <Input
                  {...register("nationality")}
                  placeholder="Enter nationality"
                  className="bg-gray-50 border-0"
                />
              </FormField>

              <FormField
                label="Phone number"
                error={errors.phoneNumber?.message}
              >
                <Input
                  {...register("phoneNumber")}
                  placeholder="000-000-0000"
                  className="bg-gray-50 border-0"
                />
              </FormField>

              {/* Club Contact (name and position) */}
              <FormField
                label="Club's contact (name and position)"
                error={errors.clubContact?.message}
              >
                <Input
                  {...register("clubContact")}
                  placeholder="Ex. John Doe, Director of Soccer"
                  className="bg-gray-50 border-0"
                />
              </FormField>
            </div>

            {/* Short paragraph describing the club */}
            <FormField
              label="Short paragraph describing the club"
              error={errors.clubDescription?.message}
            >
              <Textarea
                {...register("clubDescription")}
                placeholder="Write a short description about the club"
                className="bg-gray-50 border-0 min-h-[100px]"
              />
            </FormField>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
