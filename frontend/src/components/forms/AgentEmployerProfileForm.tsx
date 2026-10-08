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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agentEmployerProfileSchema } from "@/shchemas/profileValidation";
import { TAgentEmployerProfile } from "@/types/profile";
import { countryList } from "@/constants/selectOptions";

interface IAgentEmployerProfileFormProps {
  onNext: (data: TAgentEmployerProfile) => void;
  onPrev?: () => void;
  initialData?: Partial<TAgentEmployerProfile>;
  isLoading?: boolean;
}

export function AgentEmployerProfileForm({
  onNext,
  onPrev,
  initialData,
  isLoading,
}: IAgentEmployerProfileFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TAgentEmployerProfile>({
    resolver: zodResolver(agentEmployerProfileSchema) as any,
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

  const onSubmit = (data: TAgentEmployerProfile) => {
    onNext(data);
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
        <FormSection title="Agent Information">
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

            {/* Company Name and Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Company name"
                error={errors.companyName?.message}
              >
                <Input
                  {...register("companyName")}
                  placeholder="Name of company"
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
            </div>

            {/* Country and Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* Social Media and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Social media (optional)"
                error={errors.socialMedia?.message}
              >
                <Input
                  {...register("socialMedia")}
                  placeholder="https://www.example.com"
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

              {/* FIFA License Number */}
              <FormField
                label="FIFA license number"
                error={errors.fifaLicenseNumber?.message}
              >
                <Input
                  {...register("fifaLicenseNumber")}
                  placeholder="Enter FIFA license number"
                  className="bg-gray-50 border-0"
                />
              </FormField>
            </div>
          </div>
        </FormSection>
      </form>
    </FormLayout>
  );
}
