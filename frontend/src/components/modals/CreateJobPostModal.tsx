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
import {
  createJobSchema,
  CreateJobFormData,
  CreateJobPayload,
} from "@/shchemas/jobValidation";
import { useCreateJobMutation } from "@/redux/features/job/jobApi";
import { toast } from "sonner";
import { countryList, playerPositionOptions } from "@/constants/selectOptions";

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
  { value: "On field staff", label: "On Field Staff" },
  { value: "Office Staff", label: "Office Staff" },
];

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
  const [createJob, { isLoading }] = useCreateJobMutation();

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
      requiredAiScore: "",
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
        requiredAiScore: parseInt(data.requiredAiScore),
        requiredSkills: data.requiredSkills,
        additionalRequirements: data.additionalRequirements,
        status: "active",
      };

      await createJob(payload).unwrap();

      toast.success("Job posted successfully!");
      form.reset();
      onClose();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as { data?: { message?: string } };
      toast.error(apiError?.data?.message || "Failed to create job post");
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
              Create a Job Post
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Job Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Job details
                </h3>

                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Job title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Mid field player"
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
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: London, UK"
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
                        Country
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {countryList.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
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
                        Deadline
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="mt-1" />
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
                        Job Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
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
                        Position
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {playerPositionOptions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
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
                        Contract Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select contract type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                        Experience Level
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
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
                    Salary
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
                              placeholder="Min salary"
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
                              placeholder="Max salary"
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

                {/* Required AI Score */}
                <FormField
                  control={form.control}
                  name="requiredAiScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Required AI Score (0-100)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 70"
                          {...field}
                          className="mt-1"
                          min="0"
                          max="100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Job Descriptions */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Job descriptions
                </h3>

                {/* Job Overview */}
                <FormField
                  control={form.control}
                  name="jobOverview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Job Overview
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write something about your job..."
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
                        Responsibilities
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write something about your job..."
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
                        Requirements
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Strong physical fitness, tactical understanding..."
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
                        Required Skills
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Dribbling, Passing, Shooting, Tactical Awareness..."
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
                        Additional Requirements{" "}
                        <span className="text-gray-400">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Willingness to travel for matches..."
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
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Job Post"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
