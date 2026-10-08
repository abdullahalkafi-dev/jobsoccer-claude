"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Edit Professional Information</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Club Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Club Name */}
                <FormField label="Club Name" error={errors.clubName?.message}>
                  <Input
                    {...register("clubName")}
                    placeholder="Ex. Manchester United FC"
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Country */}
                <FormField label="Country" error={errors.country?.message}>
                  <Select
                    value={watch("country")}
                    onValueChange={(value) =>
                      setValue("country", value, { shouldValidate: true })
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

                {/* Phone Number */}
                <FormField
                  label="Phone Number"
                  error={errors.phoneNumber?.message}
                >
                  <Input
                    {...register("phoneNumber")}
                    placeholder="Ex. +1234567890"
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Website */}
                <FormField label="Website" error={errors.website?.message}>
                  <SocialMediaInput
                    register={register("website")}
                    value={watch("website") || ""}
                    placeholder="Ex. https://example.com"
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Address */}
                <FormField label="Address" error={errors.address?.message}>
                  <Input
                    {...register("address")}
                    placeholder="Ex. 123 Stadium Road"
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Location */}
                <FormField label="Location" error={errors.location?.message}>
                  <Input
                    {...register("location")}
                    placeholder="Ex. London, England"
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Founded */}
                <FormField label="Founded" error={errors.founded?.message}>
                  <Input
                    type="date"
                    {...register("founded")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Level */}
                <FormField label="Level" error={errors.level?.message}>
                  <Select
                    value={watch("level")}
                    onValueChange={(value) =>
                      setValue("level", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-0 w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Division 1">Division 1</SelectItem>
                      <SelectItem value="Division 2">Division 2</SelectItem>
                      <SelectItem value="Division 3">Division 3</SelectItem>
                      <SelectItem value="Division 4">Division 4</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Nationality */}
                <FormField
                  label="Nationality"
                  error={errors.nationality?.message}
                >
                  <Input
                    {...register("nationality")}
                    placeholder="Ex. English"
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Club Contact */}
                <FormField
                  label="Club Contact"
                  error={errors.clubContact?.message}
                >
                  <Input
                    {...register("clubContact")}
                    placeholder="Ex. John Doe, Manager"
                    className="bg-gray-50 border-0"
                  />
                </FormField>
              </div>

              {/* Club Description - Full Width */}
              <div className="mt-4">
                <FormField
                  label="Club Description"
                  error={errors.clubDescription?.message}
                >
                  <Textarea
                    {...register("clubDescription")}
                    placeholder="Tell us about your club..."
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
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-black hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
