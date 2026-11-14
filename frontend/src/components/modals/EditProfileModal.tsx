"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/fields/FormField";
import {
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
      toast.success(t("profile.updated"));
      onClose();
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage || t("profile.updateFailed"));
    }
  };

  // Determine which fields to show based on role
  const isProfessionalPlayer = userRole === "Professional Player";
  const isAmateurPlayer = userRole === "Amateur Player";
  const isHighSchool = userRole === "High School Player";
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
          <DialogTitle>{t("profile.title")}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title={t("profile.personalInformation")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <FormField
                  label={t("profile.dateOfBirth")}
                  error={errors.dateOfBirth?.message}
                >
                  <DatePicker
                    value={watch("dateOfBirth")}
                    onChange={(v) => setValue("dateOfBirth", v, { shouldValidate: true })}
                    aria-invalid={!!errors.dateOfBirth}
                    toDate={new Date()}
                    className="bg-gray-50 border-0 hover:bg-gray-50"
                  />
                </FormField>

                {/* Place of Birth */}
                <FormField
                  label={t("profile.placeOfBirth")}
                  error={errors.placeOfBirth?.message}
                >
                  <Input
                    {...register("placeOfBirth")}
                    placeholder={t("profile.placeOfBirthPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Nationality */}
                <FormField
                  label={t("profile.nationality")}
                  error={errors.nationality?.message}
                >
                  <Input
                    {...register("nationality")}
                    placeholder={t("profile.nationalityPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Phone Number */}
                <FormField
                  label={t("profile.phoneNumber")}
                  error={errors.phoneNumber?.message}
                >
                  <Input
                    {...register("phoneNumber")}
                    placeholder={t("profile.phonePh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title={t("profile.professionalInformation")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender */}
                <FormField label={t("profile.gender")} error={errors.gender?.message}>
                  <Select
                    defaultValue={initialData?.gender}
                    onValueChange={(value) =>
                      setValue("gender", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-0 w-full">
                      <SelectValue placeholder={t("profile.selectGender")} />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {label("gender", item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Position - Different options based on role */}
                <FormField label={t("profile.position")} error={errors.position?.message}>
                  {isPlayer ? (
                    <Select
                      defaultValue={initialData?.position}
                      onValueChange={(value) =>
                        setValue("position", value, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-0 w-full">
                        <SelectValue placeholder={t("profile.selectPosition")} />
                      </SelectTrigger>
                      <SelectContent>
                        {playerPositionOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {label("position", item)}
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
                        <SelectValue placeholder={t("profile.selectPosition")} />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldStaffPositionOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {label("position", item)}
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
                        <SelectValue placeholder={t("profile.selectPosition")} />
                      </SelectTrigger>
                      <SelectContent>
                        {officeStaffPositionOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {label("position", item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      {...register("position")}
                      placeholder={t("profile.positionPh")}
                      className="bg-gray-50 border-0"
                    />
                  )}
                </FormField>

                {/* Height - Only for players */}
                {isPlayer && (
                  <FormField label={t("profile.height")} error={errors.heightSize?.message}>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="any"
                        {...register("heightSize", { valueAsNumber: true })}
                        placeholder={t("profile.heightPh")}
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
                        <SelectTrigger className="min-w-20 w-auto bg-gray-50 border-0">
                          <SelectValue placeholder={t("profile.selectUnit")} />
                        </SelectTrigger>
                        <SelectContent>
                          {heightUnitOptions.map((item) => (
                            <SelectItem key={item} value={item}>
                              {label("unit", item)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormField>
                )}

                {/* Weight - Only for players */}
                {isPlayer && (
                  <FormField label={t("profile.weight")} error={errors.weightSize?.message}>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="any"
                        {...register("weightSize", { valueAsNumber: true })}
                        placeholder={t("profile.weightPh")}
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
                        <SelectTrigger className="min-w-20 w-auto bg-gray-50 border-0">
                          <SelectValue placeholder={t("profile.selectUnit")} />
                        </SelectTrigger>
                        <SelectContent>
                          {weightUnitOptions.map((item) => (
                            <SelectItem key={item} value={item}>
                              {label("unit", item)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormField>
                )}

                {/* Current Club */}
                <FormField
                  label={isStaff ? t("profile.currentEmployer") : t("profile.currentClub")}
                  error={errors.currentClub?.message}
                >
                  <Input
                    {...register("currentClub")}
                    placeholder={t("profile.currentClubPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Availability */}
                <FormField
                  label={t("profile.availableFrom")}
                  error={errors.availability?.message}
                >
                  <Input
                    {...register("availability")}
                    placeholder={t("profile.availableFromPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Foot - Only for players */}
                {isPlayer && (
                  <FormField label={t("profile.foot")} error={errors.foot?.message}>
                    <Select
                      defaultValue={initialData?.foot}
                      onValueChange={(value) =>
                        setValue("foot", value, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-0 w-full">
                        <SelectValue placeholder={t("profile.selectFoot")} />
                      </SelectTrigger>
                      <SelectContent>
                        {footOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {label("foot", item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}

                {/* League - Only for players and field staff */}
                {(isPlayer || isOnFieldStaff) && (
                  <FormField label={t("profile.league")} error={errors.league?.message}>
                    <Input
                      {...register("league")}
                      placeholder={t("profile.leaguePh")}
                      className="bg-gray-50 border-0"
                    />
                  </FormField>
                )}

                {/* Country */}
                <FormField label={t("profile.country")} error={errors.country?.message}>
                  <Select
                    defaultValue={initialData?.country}
                    onValueChange={(value) =>
                      setValue("country", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-0 w-full">
                      <SelectValue placeholder={t("profile.selectCountry")} />
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

                {/* Agent */}
                <FormField
                  label={t("profile.agent")}
                  error={errors.agent?.message}
                >
                  <Input
                    {...register("agent")}
                    placeholder={t("profile.agentPh")}
                    className="bg-gray-50 border-0"
                  />
                </FormField>

                {/* Social Media */}
                <FormField
                  label={t("profile.socialMedia")}
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
                      label={t("profile.contractExpires")}
                      error={errors.contractExpires?.message}
                    >
                      <Input
                        {...register("contractExpires")}
                        placeholder={t("profile.contractExpiresPh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField
                      label={t("profile.division")}
                      error={errors.division?.message}
                    >
                      <Select
                        defaultValue={initialData?.division}
                        onValueChange={(value) =>
                          setValue("division", value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-0 w-full">
                          <SelectValue placeholder={t("profile.selectDivision")} />
                        </SelectTrigger>
                        <SelectContent>
                          {divisionLevelOptions.map((item) => (
                            <SelectItem key={item} value={item}>
                              {label("division", item)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label={t("profile.nationalTeamCategory")}
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
                          <SelectValue placeholder={t("profile.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          {professionalPlayerNationalTeamCategoryOptions.map((item) => (
                            <SelectItem key={item} value={item}>
                              {label("category", item)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label={t("profile.nationalTeamGames")}
                      error={errors.nationalTeamGames?.message}
                    >
                      <Input
                        {...register("nationalTeamGames")}
                        placeholder={t("profile.nationalTeamGamesPh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField
                      label={t("profile.teamsJoined")}
                      error={errors.teamsJoined?.message}
                    >
                      <Input
                        {...register("teamsJoined")}
                        placeholder={t("profile.teamsJoinedPh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>
                  </>
                )}

                {/* Amateur Player specific fields */}
                {isAmateurPlayer && (
                  <FormField
                    label={t("profile.nationalTeamCategory")}
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
                        <SelectValue placeholder={t("profile.selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        {amaturePlayerNationalTeamCategoryOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {label("category", item)}
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
                      label={t("profile.schoolName")}
                      error={errors.schoolName?.message}
                    >
                      <Input
                        {...register("schoolName")}
                        placeholder={t("profile.schoolNamePh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    {isCollegeUniversity && (
                      <FormField
                        label={t("profile.collegeUniversity")}
                        error={errors.collegeOrUniversity?.message}
                      >
                        <Input
                          {...register("collegeOrUniversity")}
                          placeholder={t("profile.collegeUniversityPh")}
                          className="bg-gray-50 border-0"
                        />
                      </FormField>
                    )}

                    <FormField label={t("profile.diploma")} error={errors.diploma?.message}>
                      <Input
                        {...register("diploma")}
                        placeholder={t("profile.diplomaPh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField label={t("profile.gpa")} error={errors.gpa?.message}>
                      <Input
                        {...register("gpa")}
                        placeholder={t("profile.gpaPh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField
                      label={t("profile.satOrAct")}
                      error={errors.satOrAct?.message}
                    >
                      <Input
                        {...register("satOrAct")}
                        placeholder={t("profile.satOrActPh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>

                    <FormField
                      label={t("profile.category")}
                      error={errors.category?.message}
                    >
                      <Input
                        {...register("category")}
                        placeholder={t("profile.categoryPh")}
                        className="bg-gray-50 border-0"
                      />
                    </FormField>
                  </>
                )}

                {/* Office Staff specific fields */}
                {isOfficeStaff && (
                  <FormField
                    label={t("profile.languages")}
                    error={errors.languages?.message}
                  >
                    <Input
                      {...register("languages")}
                      placeholder={t("profile.languagesPh")}
                      className="bg-gray-50 border-0"
                    />
                  </FormField>
                )}

                {/* Field Staff category */}
                {isOnFieldStaff && (
                  <FormField label={t("profile.category")} error={errors.category?.message}>
                    <Input
                      {...register("category")}
                      placeholder={t("profile.categoryStaffPh")}
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
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-black hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? t("common.saving") : t("profile.saveChanges")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
