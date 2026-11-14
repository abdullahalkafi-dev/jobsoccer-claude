/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { months, years } from "@/constants/profile";
import { useCreateExperienceMutation } from "@/redux/features/experience/experienceApi";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
import {
  getExperienceFormSchema,
  ExperienceFormData,
} from "@/schemas/experienceValidation";

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddExperienceModal({
  isOpen,
  onClose,
}: AddExperienceModalProps) {
  const t = useTranslations("modals");
  const tv = useTranslations("validation");
  const label = useOptionLabel();
  const [createExperience, { isLoading }] = useCreateExperienceMutation();

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(getExperienceFormSchema(tv)),
    defaultValues: {
      title: "",
      employmentType: "",
      club: "",
      location: "",
      isCurrentlyWorking: false,
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      description: "",
    },
  });

  const isCurrentlyWorking = form.watch("isCurrentlyWorking");

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      const experienceData = {
        title: data.title,
        employmentType: data.employmentType,
        club: data.club,
        location: data.location,
        startMonth: data.startMonth,
        startYear: parseInt(data.startYear),
        isCurrentlyWorking: data.isCurrentlyWorking,
        description: data.description,
        ...(data.endMonth && { endMonth: data.endMonth }),
        ...(data.endYear && { endYear: parseInt(data.endYear) }),
      };

      const result = await createExperience(experienceData).unwrap();

      if (result.success) {
        toast.success(result.message || t("experience.added"));
        form.reset();
        onClose();
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("experience.addFailed")
      );
      console.error("Error creating experience:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {t("experience.addTitle")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("experience.title")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("experience.titlePh")}
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employment Type */}
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("experience.employmentType")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("common.pleaseSelect")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FullTime">{t("experience.fullTime")}</SelectItem>
                      <SelectItem value="PartTime">{t("experience.partTime")}</SelectItem>
                      <SelectItem value="Contract">{t("experience.contract")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Club */}
            <FormField
              control={form.control}
              name="club"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("experience.club")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("experience.clubPh")}
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("experience.jobLocation")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("experience.jobLocationPh")}
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currently Working Checkbox */}
            <FormField
              control={form.control}
              name="isCurrentlyWorking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal text-gray-700">
                      {t("experience.currentlyWorking")}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Start Date */}
            <div>
              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                {t("common.startDate")}
              </FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startMonth"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.month")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {label("month", month)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.year")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* End Date */}
            {!isCurrentlyWorking && (
              <div>
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("common.endDate")}
                </FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="endMonth"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder={t("common.month")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {label("month", month)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endYear"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder={t("common.year")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("experience.description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("experience.descriptionPh")}
                      className="mt-1 min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
