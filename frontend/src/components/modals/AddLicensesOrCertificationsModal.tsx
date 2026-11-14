/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { months, years } from "@/constants/profile";
import { useCreateCertificateMutation } from "@/redux/features/certificate/certificateApi";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";

const getFormSchema = (t: (key: string) => string) =>
  z.object({
  name: z.string().min(1, t("certificate.nameRequired")),
  issuingOrganization: z.string().min(1, t("certificate.organizationRequired")),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  startMonth: z.string().min(1, t("certificate.startMonthRequired")),
  startYear: z.string().min(1, t("certificate.startYearRequired")),
  endMonth: z.string().optional(),
  endYear: z.string().optional(),
  description: z.string().optional(),
});

export type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddExperienceOrCertificationsModal({
  isOpen,
  onClose,
}: AddExperienceModalProps) {
  const t = useTranslations("modals");
  const label = useOptionLabel();
  const [createCertificate, { isLoading }] = useCreateCertificateMutation();

  const form = useForm<FormData>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      name: "",
      issuingOrganization: "",
      credentialId: "",
      credentialUrl: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const certificateData = {
        name: data.name,
        issuingOrganization: data.issuingOrganization,
        startMonth: data.startMonth,
        startYear: parseInt(data.startYear),
        ...(data.endMonth && { endMonth: data.endMonth }),
        ...(data.endYear && { endYear: parseInt(data.endYear) }),
        ...(data.credentialId && { credentialId: data.credentialId }),
        ...(data.credentialUrl && { credentialUrl: data.credentialUrl }),
        ...(data.description && { description: data.description }),
      };

      const result = await createCertificate(certificateData).unwrap();

      if (result.success) {
        toast.success(result.message || t("certificate.added"));
        form.reset();
        onClose();
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("certificate.addFailed")
      );
      console.error("Error creating certificate:", error);
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
              {t("certificate.addTitle")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("certificate.name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("certificate.namePh")}
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Issuing Organization */}
            <FormField
              control={form.control}
              name="issuingOrganization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("certificate.issuingOrganization")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("certificate.issuingOrganizationPh")} {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
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

            {/* Credential ID */}
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("certificate.credentialId")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("certificate.credentialIdPh")}
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential URL */}
            <FormField
              control={form.control}
              name="credentialUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("certificate.credentialUrl")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/credential"
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("certificate.description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("certificate.descriptionPh")}
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
