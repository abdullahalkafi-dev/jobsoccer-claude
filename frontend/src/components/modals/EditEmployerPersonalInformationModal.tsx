"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
import { useUpdateProfileMutation } from "@/redux/features/user/userApi";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import { countryList } from "@/constants/selectOptions";
import { SocialMediaInput } from "@/components/shared/SocialMediaInput";

const formSchema = z.object({
  clubName: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  founded: z.string().optional(),
  level: z.string().optional(),
  nationality: z.string().optional(),
  clubContact: z.string().optional(),
  clubDescription: z.string().optional(),
});

export type EmployerProfileFormData = z.infer<typeof formSchema>;

interface EditEmployerPersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<EmployerProfileFormData>;
}

export default function EditEmployerPersonalInformationModal({
  isOpen,
  onClose,
  initialData,
}: EditEmployerPersonalInformationModalProps) {
  const t = useTranslations("modals");
  const label = useOptionLabel();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployerProfileFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clubName: initialData?.clubName || "",
      country: initialData?.country || "",
      phoneNumber: initialData?.phoneNumber || "",
      website: initialData?.website || "",
      address: initialData?.address || "",
      location: initialData?.location || "",
      founded: initialData?.founded
        ? new Date(initialData.founded).toISOString().split("T")[0]
        : "",
      level: initialData?.level || "",
      nationality: initialData?.nationality || "",
      clubContact: initialData?.clubContact || "",
      clubDescription: initialData?.clubDescription || "",
    },
    mode: "onChange",
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        clubName: initialData?.clubName || "",
        country: initialData?.country || "",
        phoneNumber: initialData?.phoneNumber || "",
        website: initialData?.website || "",
        address: initialData?.address || "",
        location: initialData?.location || "",
        founded: initialData?.founded
          ? new Date(initialData.founded).toISOString().split("T")[0]
          : "",
        level: initialData?.level || "",
        nationality: initialData?.nationality || "",
        clubContact: initialData?.clubContact || "",
        clubDescription: initialData?.clubDescription || "",
      });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: EmployerProfileFormData) => {
    try {
      const formData = new FormData();

      // Create a data object with only the fields that have values
      const profileData: Record<string, string> = {};

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          profileData[key] = value;
        }
      });

      // Append the data object as JSON string to FormData
      formData.append("data", JSON.stringify(profileData));

      await updateProfile(formData).unwrap();
      toast.success(t("employer.updated"));
      onClose();
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage || t("employer.updateFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{t("employer.title")}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title={t("employer.clubInformation")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Club Name */}
                <FormField label={t("employer.clubName")} error={errors.clubName?.message}>
                  <Input
                    {...register("clubName")}
                    placeholder={t("employer.clubNamePh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Country */}
                <FormField label={t("employer.country")} error={errors.country?.message}>
                  <Select
                    value={watch("country")}
                    onValueChange={(value) =>
                      setValue("country", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-0 w-full">
                      <SelectValue placeholder={t("employer.selectCountry")} />
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

                {/* Phone Number */}
                <FormField
                  label={t("employer.phoneNumber")}
                  error={errors.phoneNumber?.message}
                >
                  <Input
                    {...register("phoneNumber")}
                    placeholder={t("employer.phonePh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Website */}
                <FormField label={t("employer.website")} error={errors.website?.message}>
                  <SocialMediaInput
                    register={register("website")}
                    value={watch("website") || ""}
                    placeholder={t("employer.websitePh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Address */}
                <FormField label={t("employer.address")} error={errors.address?.message}>
                  <Input
                    {...register("address")}
                    placeholder={t("employer.addressPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Location */}
                <FormField label={t("employer.location")} error={errors.location?.message}>
                  <Input
                    {...register("location")}
                    placeholder={t("employer.locationPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Founded */}
                <FormField label={t("employer.founded")} error={errors.founded?.message}>
                  <DatePicker
                    value={watch("founded")}
                    onChange={(v) => setValue("founded", v, { shouldValidate: true })}
                    aria-invalid={!!errors.founded}
                    className="bg-gray-50 border-0 hover:bg-gray-50"
                  />
                </FormField>

                {/* Level */}
                <FormField label={t("employer.level")} error={errors.level?.message}>
                  <Select
                    value={watch("level")}
                    onValueChange={(value) =>
                      setValue("level", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-0 w-full">
                      <SelectValue placeholder={t("employer.selectLevel")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Division 1">{label("division", "Division 1")}</SelectItem>
                      <SelectItem value="Division 2">{label("division", "Division 2")}</SelectItem>
                      <SelectItem value="Division 3">{label("division", "Division 3")}</SelectItem>
                      <SelectItem value="Division 4">{label("division", "Division 4")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Nationality */}
                <FormField
                  label={t("employer.nationality")}
                  error={errors.nationality?.message}
                >
                  <Input
                    {...register("nationality")}
                    placeholder={t("employer.nationalityPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Club Contact */}
                <FormField
                  label={t("employer.clubContact")}
                  error={errors.clubContact?.message}
                >
                  <Input
                    {...register("clubContact")}
                    placeholder={t("employer.clubContactPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>
              </div>

              {/* Club Description - Full Width */}
              <div className="mt-4">
                <FormField
                  label={t("employer.clubDescription")}
                  error={errors.clubDescription?.message}
                >
                  <Textarea
                    {...register("clubDescription")}
                    placeholder={t("employer.clubDescriptionPh")}
                    className="bg-gray-50 border-0 min-h-[120px]"
                    rows={5}
                  />
                </FormField>
              </div>
            </FormSection>
          </form>
        </div>

        {/* Action buttons - Fixed at bottom */}
        <div className="px-6 py-4 border-t bg-white flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-black hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? t("common.saving") : t("employer.saveChanges")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
