"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useUpdateProfileMutation } from "@/redux/features/user/userApi";
import { toast } from "sonner";
import { useEffect } from "react";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import {
  availabilityOptions,
  countryList,
  divisionLevelOptions,
  footOptions,
  genderOptions,
  heightUnitOptions,
  playerPositionOptions,
  weightUnitOptions,
  officeStaffPositionOptions,
  fieldStaffPositionOptions,
  amaturePlayerNationalTeamCategoryOptions,
  professionalPlayerNationalTeamCategoryOptions,
} from "@/constants/selectOptions";

const formSchema = z.object({
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  position: z.string().optional(),
  heightSize: z.number().optional(),
  heightUnit: z.string().optional(),
  weightSize: z.number().optional(),
  weightUnit: z.string().optional(),
  currentClub: z.string().optional(),
  availability: z.string().optional(),
  foot: z.string().optional(),
  league: z.string().optional(),
  country: z.string().optional(),
  agent: z.string().optional(),
  socialMedia: z.string().optional(),
  contractExpires: z.string().optional(),
  division: z.string().optional(),
  nationalTeamCategory: z.string().optional(),
  nationalTeamGames: z.string().optional(),
  teamsJoined: z.string().optional(),
  schoolName: z.string().optional(),
  collegeOrUniversity: z.string().optional(),
  diploma: z.string().optional(),
  gpa: z.string().optional(),
  satOrAct: z.string().optional(),
  category: z.string().optional(),
  languages: z.string().optional(),
});

export type PersonalInformationFormData = z.infer<typeof formSchema>;

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<PersonalInformationFormData> & {
    height?: { size: number; unit: string };
    weight?: { size: number; unit: string };
  };
  userRole?: string;
  userType?: string;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  userRole = "",
}: PersonalInformationModalProps) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PersonalInformationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOfBirth: initialData?.dateOfBirth
        ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
        : "",
      placeOfBirth: initialData?.placeOfBirth || "",
      nationality: initialData?.nationality || "",
      phoneNumber: initialData?.phoneNumber || "",
      gender: initialData?.gender || "",
      position: initialData?.position || "",
      heightSize: initialData?.height?.size || undefined,
      heightUnit: initialData?.height?.unit || "ft",
      weightSize: initialData?.weight?.size || undefined,
      weightUnit: initialData?.weight?.unit || "kg",
      currentClub: initialData?.currentClub || "",
      availability: initialData?.availability || "",
      foot: initialData?.foot || "",
      league: initialData?.league || "",
      country: initialData?.country || "",
      agent: initialData?.agent || "",
      socialMedia: initialData?.socialMedia || "",
      contractExpires: initialData?.contractExpires || "",
      division: initialData?.division || "",
      nationalTeamCategory: initialData?.nationalTeamCategory || "",
      nationalTeamGames: initialData?.nationalTeamGames || "",
      teamsJoined: initialData?.teamsJoined || "",
      schoolName: initialData?.schoolName || "",
      collegeOrUniversity: initialData?.collegeOrUniversity || "",
      diploma: initialData?.diploma || "",
      gpa: initialData?.gpa || "",
      satOrAct: initialData?.satOrAct || "",
      category: initialData?.category || "",
      languages: initialData?.languages || "",
    },
    mode: "onChange",
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        dateOfBirth: initialData?.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
          : "",
        placeOfBirth: initialData?.placeOfBirth || "",
        nationality: initialData?.nationality || "",
        phoneNumber: initialData?.phoneNumber || "",
        gender: initialData?.gender || "",
        position: initialData?.position || "",
        heightSize: initialData?.height?.size || undefined,
        heightUnit: initialData?.height?.unit || "ft",
        weightSize: initialData?.weight?.size || undefined,
        weightUnit: initialData?.weight?.unit || "kg",
        currentClub: initialData?.currentClub || "",
        availability: initialData?.availability || "",
        foot: initialData?.foot || "",
        league: initialData?.league || "",
        country: initialData?.country || "",
        agent: initialData?.agent || "",
        socialMedia: initialData?.socialMedia || "",
        contractExpires: initialData?.contractExpires || "",
        division: initialData?.division || "",
        nationalTeamCategory: initialData?.nationalTeamCategory || "",
        nationalTeamGames: initialData?.nationalTeamGames || "",
        teamsJoined: initialData?.teamsJoined || "",
        schoolName: initialData?.schoolName || "",
        collegeOrUniversity: initialData?.collegeOrUniversity || "",
        diploma: initialData?.diploma || "",
        gpa: initialData?.gpa || "",
        satOrAct: initialData?.satOrAct || "",
        category: initialData?.category || "",
        languages: initialData?.languages || "",
      });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: PersonalInformationFormData) => {
    try {
      const formData = new FormData();

      // Create a data object with only the fields that have values
      const profileData: Record<
        string,
        string | number | { size?: number; unit?: string }
      > = {};

      // Handle height and weight separately
      const heightData: { size?: number; unit?: string } = {};
      const weightData: { size?: number; unit?: string } = {};

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          // Handle height and weight objects
          if (key === "heightSize") {
            heightData.size = value as number;
          } else if (key === "heightUnit") {
            heightData.unit = value as string;
          } else if (key === "weightSize") {
            weightData.size = value as number;
          } else if (key === "weightUnit") {
            weightData.unit = value as string;
          } else {
            profileData[key] = value;
          }
        }
      });

      // Add height and weight to profileData if they have values
      if (heightData.size || heightData.unit) {
        profileData.height = heightData;
      }
      if (weightData.size || weightData.unit) {
        profileData.weight = weightData;
      }

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

  // Determine which fields to show based on role
  const isProfessionalPlayer = userRole === "Professional Player";
  const isAmateurPlayer = userRole === "Amateur Player";
  const isHighSchool = userRole === " High School Player";
  const isCollegeUniversity = userRole === "College/University Player";
  const isOnFieldStaff = userRole === "On field staff";
  const isOfficeStaff = userRole === "Office Staff";

  const isPlayer =
    isProfessionalPlayer ||
    isAmateurPlayer ||
    isHighSchool ||
    isCollegeUniversity;
  const isStaff = isOnFieldStaff || isOfficeStaff;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Edit Profile Information</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <FormField
                  label="Date of Birth"
                  error={errors.dateOfBirth?.message}
                >
                  <Input
                    type="date"
                    {...register("dateOfBirth")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Place of Birth */}
                <FormField
                  label="Place of Birth"
                  error={errors.placeOfBirth?.message}
                >
                  <Input
                    {...register("placeOfBirth")}
                    placeholder="Ex. London, UK"
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Nationality */}
                <FormField
                  label="Nationality"
                  error={errors.nationality?.message}
                >
                  <Input
                    {...register("nationality")}
                    placeholder="Ex. British"
                    className="bg-gray-50 border-0"
                  />
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
              </div>
            </FormSection>

            <FormSection title="Professional Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender */}
                <FormField label="Gender" error={errors.gender?.message}>
                  <Select
                    defaultValue={initialData?.gender}
                    onValueChange={(value) =>
                      setValue("gender", value, { shouldValidate: true })
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

                {/* Position - Different options based on role */}
                <FormField label="Position" error={errors.position?.message}>
                  {isPlayer ? (
                    <Select
                      defaultValue={initialData?.position}
                      onValueChange={(value) =>
                        setValue("position", value, { shouldValidate: true })
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
                  ) : isOnFieldStaff ? (
                    <Select
                      defaultValue={initialData?.position}
                      onValueChange={(value) =>
                        setValue("position", value, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-0 w-full">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldStaffPositionOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : isOfficeStaff ? (
                    <Select
                      defaultValue={initialData?.position}
                      onValueChange={(value) =>
                        setValue("position", value, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-0 w-full">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {officeStaffPositionOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      {...register("position")}
                      placeholder="Your position"
                      className="bg-gray-50 border-0"
                    />
                  )}
                </FormField>

                {/* Height - Only for players */}
                {isPlayer && (
                  <FormField label="Height" error={errors.heightSize?.message}>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="any"
                        {...register("heightSize", { valueAsNumber: true })}
                        placeholder="Ex. 5.7"
                        className="bg-gray-50 border-0"
                      />
                      <Select
                        defaultValue={initialData?.height?.unit || "ft"}
                        onValueChange={(value) =>
                          setValue("heightUnit", value, {
                            shouldValidate: true,
                          })
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
                )}

                {/* Weight - Only for players */}
                {isPlayer && (
                  <FormField label="Weight" error={errors.weightSize?.message}>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="any"
                        {...register("weightSize", { valueAsNumber: true })}
                        placeholder="Ex. 75"
                        className="bg-gray-50 border-0"
                      />
                      <Select
                        defaultValue={initialData?.weight?.unit || "kg"}
                        onValueChange={(value) =>
                          setValue("weightUnit", value, {
                            shouldValidate: true,
                          })
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
                )}

                {/* Current Club */}
                <FormField
                  label={isStaff ? "Current Employer" : "Current Club"}
                  error={errors.currentClub?.message}
                >
                  <Input
                    {...register("currentClub")}
                    placeholder={
                      isStaff ? "Ex. Real Madrid" : "Ex. Real Madrid"
                    }
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Availability */}
                <FormField
                  label="Availability (optional)"
                  error={errors.availability?.message}
                >
                  <Select
                    defaultValue={initialData?.availability}
                    onValueChange={(value) =>
                      setValue("availability", value, { shouldValidate: true })
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

                {/* Foot - Only for players */}
                {isPlayer && (
                  <FormField label="Foot" error={errors.foot?.message}>
                    <Select
                      defaultValue={initialData?.foot}
                      onValueChange={(value) =>
                        setValue("foot", value, { shouldValidate: true })
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
                )}

                {/* League - Only for players and field staff */}
                {(isPlayer || isOnFieldStaff) && (
                  <FormField label="League" error={errors.league?.message}>
                    <Input
                      {...register("league")}
                      placeholder="Ex. Premier League"
                      className="bg-gray-50 border-0"
                    />
                  </FormField>
                )}

                {/* Country */}
                <FormField label="Country" error={errors.country?.message}>
                  <Select
                    defaultValue={initialData?.country}
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

                {/* Agent */}
                <FormField
                  label="Agent (if applicable)"
                  error={errors.agent?.message}
                >
                  <Input
                    {...register("agent")}
                    placeholder="Ex. Jorge Mendes"
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

                {/* Professional Player specific fields */}
                {isProfessionalPlayer && (
                  <>
                    <FormField
                      label="Contract Expires"
                      error={errors.contractExpires?.message}
                    >
                      <Input
                        {...register("contractExpires")}
                        placeholder="Ex. June 2025"
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField
                      label="Division"
                      error={errors.division?.message}
                    >
                      <Select
                        defaultValue={initialData?.division}
                        onValueChange={(value) =>
                          setValue("division", value, { shouldValidate: true })
                        }
                      >
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

                    <FormField
                      label="National Team Category"
                      error={errors.nationalTeamCategory?.message}
                    >
                      <Select
                        defaultValue={initialData?.nationalTeamCategory}
                        onValueChange={(value) =>
                          setValue("nationalTeamCategory", value, {
                            shouldValidate: true,
                          })
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

                    <FormField
                      label="Teams Joined"
                      error={errors.teamsJoined?.message}
                    >
                      <Input
                        {...register("teamsJoined")}
                        placeholder="Ex. 5"
                        className="bg-gray-50 border-0"
                      />
                    </FormField>
                  </>
                )}

                {/* Amateur Player specific fields */}
                {isAmateurPlayer && (
                  <FormField
                    label="National Team Category"
                    error={errors.nationalTeamCategory?.message}
                  >
                    <Select
                      defaultValue={initialData?.nationalTeamCategory}
                      onValueChange={(value) =>
                        setValue("nationalTeamCategory", value, {
                          shouldValidate: true,
                        })
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
                )}

                {/* School/College specific fields */}
                {(isHighSchool || isCollegeUniversity) && (
                  <>
                    <FormField
                      label="School Name"
                      error={errors.schoolName?.message}
                    >
                      <Input
                        {...register("schoolName")}
                        placeholder="Ex. Lincoln High School"
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    {isCollegeUniversity && (
                      <FormField
                        label="College/University"
                        error={errors.collegeOrUniversity?.message}
                      >
                        <Input
                          {...register("collegeOrUniversity")}
                          placeholder="Ex. Stanford University"
                          className="bg-gray-50 border-0"
                        />
                      </FormField>
                    )}

                    <FormField label="Diploma" error={errors.diploma?.message}>
                      <Input
                        {...register("diploma")}
                        placeholder="Ex. High School Diploma"
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField label="GPA" error={errors.gpa?.message}>
                      <Input
                        {...register("gpa")}
                        placeholder="Ex. 3.8"
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField
                      label="SAT/ACT Score"
                      error={errors.satOrAct?.message}
                    >
                      <Input
                        {...register("satOrAct")}
                        placeholder="Ex. 1450"
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField
                      label="Category"
                      error={errors.category?.message}
                    >
                      <Input
                        {...register("category")}
                        placeholder="Ex. Varsity"
                        className="bg-gray-50 border-0"
                      />
                    </FormField>
                  </>
                )}

                {/* Office Staff specific fields */}
                {isOfficeStaff && (
                  <FormField
                    label="Languages"
                    error={errors.languages?.message}
                  >
                    <Input
                      {...register("languages")}
                      placeholder="Ex. English, Spanish, French"
                      className="bg-gray-50 border-0"
                    />
                  </FormField>
                )}

                {/* Field Staff category */}
                {isOnFieldStaff && (
                  <FormField label="Category" error={errors.category?.message}>
                    <Input
                      {...register("category")}
                      placeholder="Ex. Head Coach"
                      className="bg-gray-50 border-0"
                    />
                  </FormField>
                )}
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
