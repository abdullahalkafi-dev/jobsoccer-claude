"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  createJobSchema,
  CreateJobFormData,
  CreateJobPayload,
} from "@/schemas/jobValidation";
import { useCreateJobMutation } from "@/redux/features/job/jobApi";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
import { sortByLabel } from "@/i18n/sort";
import {
  countryList,
  fieldStaffPositionOptions,
  officeStaffPositionOptions,
  playerPositionOptions,
} from "@/constants/selectOptions";

interface CreateJobPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const jobCategories = [
  { value: "Professional Player", label: "Professional Player" },
  { value: "Amateur Player", label: "Amateur Player" },
  { value: "High School Player", label: "High School Player" },
  { value: "College/University Player", label: "College/University Player" }, 
  { value: "On field staff", label: "On-Field Staff" },
  { value: "Office Staff", label: "Office Staff" },
];

/** Positions an employer can pick for a job, by the category of candidate it is for. */
const positionOptionsFor = (category?: string): readonly string[] => {
  if (category === "On field staff") return fieldStaffPositionOptions;
  if (category === "Office Staff") return officeStaffPositionOptions;
  return playerPositionOptions;
};

const contractTypes = [
  { value: "FullTime", label: "Full Time" },
  { value: "PartTime", label: "Part Time" },
  { value: "Contract", label: "Contract" },
];

const experienceLevels = [
  { value: "Entry Level", label: "Entry Level" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Mid-Level", label: "Mid-Level" },
  { value: "Mid-Senior", label: "Mid-Senior" },
  { value: "Senior", label: "Senior" },
];

export default function CreateJobPostModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateJobPostModalProps) {
  const t = useTranslations("jobs.create");
  const label = useOptionLabel();
  const locale = useLocale();
  const [createJob, { isLoading }] = useCreateJobMutation();
  const contractLabel = (value: string) =>
    value === "FullTime" ? t("fullTime") : value === "PartTime" ? t("partTime") : value === "Contract" ? t("contract") : value;

  const form = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      jobTitle: "",
      location: "",
      country: "",
      deadline: "",
      jobCategory: "",
      position: "",
      contractType: "",
      minSalary: "",
      maxSalary: "",
      experience: undefined,
      jobOverview: "",
      responsibilities: "",
      requirements: "",
      requiredSkills: "",
      additionalRequirements: "",
    },
  });

  const onSubmit = async (data: CreateJobFormData) => {
    try {
      // Transform form data to API payload
      const payload: CreateJobPayload = {
        jobTitle: data.jobTitle,
        location: data.location,
        country: data.country,
        deadline: data.deadline,
        jobOverview: data.jobOverview,
        jobCategory: data.jobCategory,
        position: data.position,
        contractType: data.contractType,
        salary: {
          min: parseFloat(data.minSalary),
          max: parseFloat(data.maxSalary),
        },
        experience: data.experience,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        requiredSkills: data.requiredSkills,
        additionalRequirements: data.additionalRequirements,
        status: "active",
      };

      await createJob(payload).unwrap();

      toast.success(t("success"));
      form.reset();
      onClose();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as { data?: { message?: string } };
      toast.error(apiError?.data?.message || t("failed"));
      console.error("Failed to create job:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {t("title")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Job Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {t("jobDetails")}
                </h3>

                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("jobTitle")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("jobTitlePlaceholder")}
                          {...field}
                          className="mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("location")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("locationPlaceholder")}
                          {...field}
                          className="mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("country")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t("selectCountry")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {sortByLabel([...countryList], (c) => label("country", c), locale).map((country) => (
                            <SelectItem key={country} value={country}>
                              {label("country", country)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deadline */}
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("deadline")}
                      </FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!form.formState.errors.deadline} className="mt-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Category */}
                <FormField
                  control={form.control}
                  name="jobCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("jobCategory")}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // the position list depends on the category
                          form.setValue("position", "", { shouldValidate: false });
                        }}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t("selectCategory")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {label("role", category.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Position */}
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("position")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t("selectPosition")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positionOptionsFor(form.watch("jobCategory")).map((position) => (
                            <SelectItem key={position} value={position}>
                              {label("position", position)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contract Type */}
                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("contractType")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t("selectContract")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {contractLabel(type.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Experience */}
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("experienceLevel")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t("selectExperience")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {label("experience", level.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Salary Range */}
                <div>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                    {t("salary")}
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t("minSalary")}
                              {...field}
                              className="mt-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t("maxSalary")}
                              {...field}
                              className="mt-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Job Descriptions */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {t("jobDescriptions")}
                </h3>

                {/* Job Overview */}
                <FormField
                  control={form.control}
                  name="jobOverview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("jobOverview")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("writePlaceholder")}
                          className="mt-1 min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Responsibilities */}
                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("responsibilities")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("writePlaceholder")}
                          className="mt-1 min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Requirements */}
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("requirements")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("requirementsPlaceholder")}
                          className="mt-1 min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Required Skills */}
                <FormField
                  control={form.control}
                  name="requiredSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("requiredSkills")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("skillsPlaceholder")}
                          className="mt-1 min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Additional Requirements (Optional) */}
                <FormField
                  control={form.control}
                  name="additionalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("additionalRequirements")}{" "}
                        <span className="text-gray-400">{t("optional")}</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("additionalPlaceholder")}
                          className="mt-1 min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? t("creating") : t("create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
