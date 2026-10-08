/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { months, years } from "@/constants/profile";
import { useUpdateEducationMutation } from "@/redux/features/education/educationApi";
import { EducationData } from "@/types/education";
import { toast } from "sonner";
import {
  educationFormSchema,
  EducationFormData,
} from "@/shchemas/educationValidation";

interface EditEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationData: EducationData;
}

export default function EditEducationModal({
  isOpen,
  onClose,
  educationData,
}: EditEducationModalProps) {
  const [updateEducation, { isLoading }] = useUpdateEducationMutation();

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      instituteName: "",
      degree: "",
      fieldOfStudy: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      grade: "",
      isCurrentlyStudying: false,
      description: "",
    },
  });

  const isCurrentlyStudying = form.watch("isCurrentlyStudying");

  // Pre-populate form when educationData changes
  useEffect(() => {
    if (educationData && isOpen) {
      form.reset({
        instituteName: educationData.instituteName,
        degree: educationData.degree,
        fieldOfStudy: educationData.fieldOfStudy,
        startMonth: educationData.startMonth,
        startYear: educationData.startYear.toString(),
        endMonth: educationData.endMonth || "",
        endYear: educationData.endYear?.toString() || "",
        grade: educationData.grade || "",
        isCurrentlyStudying: educationData.isCurrentlyStudying || false,
        description: educationData.description || "",
      });
    }
  }, [educationData, isOpen, form]);

  const onSubmit = async (data: EducationFormData) => {
    if (!educationData._id) return;

    try {
      const updateData = {
        instituteName: data.instituteName,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startMonth: data.startMonth,
        startYear: parseInt(data.startYear),
        isCurrentlyStudying: data.isCurrentlyStudying,
        ...(data.grade && { grade: data.grade }),
        ...(data.description && { description: data.description }),
        ...(data.endMonth && { endMonth: data.endMonth }),
        ...(data.endYear && { endYear: parseInt(data.endYear) }),
      };

      const result = await updateEducation({
        id: educationData._id,
        body: updateData,
      }).unwrap();

      if (result.success) {
        toast.success(result.message || "Education updated successfully!");
        form.reset();
        onClose();
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update education. Please try again."
      );
      console.error("Error updating education:", error);
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
              Edit Education
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Institute Name */}
            <FormField
              control={form.control}
              name="instituteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Institute Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: University of Dhaka"
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Degree */}
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Degree
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Bachelor of Science"
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field of Study */}
            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Field of Study
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Computer Science and Engineering"
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currently Studying Checkbox */}
            <FormField
              control={form.control}
              name="isCurrentlyStudying"
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
                      I&apos;m currently studying here
                    </FormLabel>
                  </div>
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

            {/* End Date - Only show if not currently studying */}
            {!isCurrentlyStudying && (
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
                          value={field.value || ""}
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
                          value={field.value || ""}
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
            )}

            {/* Grade (Optional) */}
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Grade (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 3.85 CGPA"
                      {...field}
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (Optional) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your education experience..."
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
