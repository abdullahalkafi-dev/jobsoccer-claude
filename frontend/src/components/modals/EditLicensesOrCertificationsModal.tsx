/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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
import { useUpdateCertificateMutation } from "@/redux/features/certificate/certificateApi";
import { toast } from "sonner";
import { CertificateData } from "@/types/certificate";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  issuingOrganization: z.string().min(1, "Issuing organization is required"),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  startMonth: z.string().min(1, "Start month is required"),
  startYear: z.string().min(1, "Start year is required"),
  endMonth: z.string().optional(),
  endYear: z.string().optional(),
  description: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

interface EditLicenseOrCertificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificationData: CertificateData | null;
}

export default function EditLicenseOrCertificationsModal({
  isOpen,
  onClose,
  certificationData,
}: EditLicenseOrCertificationsModalProps) {
  const [updateCertificate, { isLoading }] = useUpdateCertificateMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  // Pre-populate form when certificationData changes
  useEffect(() => {
    if (certificationData && isOpen) {
      // Convert month name to ensure it matches the select options
      const normalizeMonth = (month: string | undefined) => {
        if (!month) return "";
        // If it's a number, convert to month name
        const monthNum = parseInt(month);
        if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
          return months[monthNum - 1];
        }
        // Otherwise, return the month name as is
        return month;
      };

      form.reset({
        name: certificationData.name,
        issuingOrganization: certificationData.issuingOrganization,
        credentialId: certificationData.credentialId || "",
        credentialUrl: certificationData.credentialUrl || "",
        startMonth: normalizeMonth(certificationData.startMonth),
        startYear: certificationData.startYear.toString(),
        endMonth: normalizeMonth(certificationData.endMonth),
        endYear: certificationData.endYear?.toString() || "",
        description: certificationData.description || "",
      });
    }
  }, [certificationData, isOpen, form]);

  const onSubmit = async (data: FormData) => {
    if (!certificationData?._id) {
      toast.error("Certificate ID is missing");
      return;
    }

    try {
      const updateData = {
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

      const result = await updateCertificate({
        id: certificationData._id,
        body: updateData,
      }).unwrap();

      if (result.success) {
        toast.success(result.message || "Certificate updated successfully!");
        form.reset();
        onClose();
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to update certificate. Please try again."
      );
      console.error("Error updating certificate:", error);
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
              Edit License or Certification
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
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: UEFA Pro License"
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
                    Issuing Organization
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: UEFA" {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <div>
              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                Start date
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
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
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
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
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
                End date
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
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
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
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
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
                    Credential ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 12345678"
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
                    Credential URL
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
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your license or certification"
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
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
