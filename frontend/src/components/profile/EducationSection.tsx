/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, GraduationCap, Loader2, Trash2 } from "lucide-react";
import {
  useGetUserEducationsQuery,
  useDeleteEducationMutation,
} from "@/redux/features/education/educationApi";
import { EducationData } from "@/types/education";
import { toast } from "sonner";
import { useState } from "react";
import AddEducationModal from "@/components/modals/AddEducationModal";
import EditEducationModal from "@/components/modals/EditEducationModal";

interface EducationSectionProps {
  userId: string;
  readOnly?: boolean;
}

export default function EducationSection({
  userId,
  readOnly = false,
}: EducationSectionProps) {
  const [deleteEducation] = useDeleteEducationMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEducationData, setEditEducationData] =
    useState<EducationData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: educationsData,
    isLoading: isLoadingEducations,
    error: educationsError,
  } = useGetUserEducationsQuery(userId, {
    skip: !userId,
  });

  const handleDeleteClick = (educationId: string, instituteName: string) => {
    setEducationToDelete({ id: educationId, name: instituteName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!educationToDelete) return;

    try {
      const result = await deleteEducation(educationToDelete.id).unwrap();
      if (result.success) {
        toast.success(result.message || "Education deleted successfully!");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to delete education. Please try again."
      );
      console.error("Error deleting education:", error);
    } finally {
      setDeleteDialogOpen(false);
      setEducationToDelete(null);
    }
  };

  const handleEditClick = (education: EducationData) => {
    setEditEducationData(education);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-md md:text-xl">Education</CardTitle>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {isLoadingEducations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : educationsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Failed to load educations</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : !educationsData?.data || educationsData.data.length === 0 ? (
            <EmptyEducationState
              onAddClick={() => setIsAddModalOpen(true)}
              readOnly={readOnly}
            />
          ) : (
            <EducationList
              educations={educationsData.data}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              readOnly={readOnly}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddEducationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editEducationData && (
        <EditEducationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditEducationData(null);
          }}
          educationData={editEducationData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your education at{" "}
              <span className="font-semibold">{educationToDelete?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface EmptyEducationStateProps {
  onAddClick: () => void;
  readOnly?: boolean;
}

function EmptyEducationState({
  onAddClick,
  readOnly = false,
}: EmptyEducationStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <GraduationCap className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Education Added Yet
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {readOnly
          ? "This user hasn't added any education yet."
          : "Showcase your academic background by adding your education. This helps employers understand your qualifications and expertise."}
      </p>
      {!readOnly && (
        <Button
          onClick={onAddClick}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Education
        </Button>
      )}
    </div>
  );
}

interface EducationListProps {
  educations: any[];
  onEditClick: (education: EducationData) => void;
  onDeleteClick: (educationId: string, instituteName: string) => void;
  readOnly?: boolean;
}

function EducationList({
  educations,
  onEditClick,
  onDeleteClick,
  readOnly = false,
}: EducationListProps) {
  return (
    <div className="space-y-6">
      {educations.map((edu: any) => (
        <EducationItem
          key={edu._id}
          education={edu}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

interface EducationItemProps {
  education: any;
  onEditClick: (education: EducationData) => void;
  onDeleteClick: (educationId: string, instituteName: string) => void;
  readOnly?: boolean;
}

function EducationItem({
  education,
  onEditClick,
  onDeleteClick,
  readOnly = false,
}: EducationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteClick(education._id, education.instituteName);
    setIsDeleting(false);
  };

  return (
    <div className="flex space-x-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="shrink-0">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {education.instituteName}
            </h3>
            <p className="text-sm text-gray-600">Degree: {education.degree}</p>
            <p className="text-sm text-gray-600">
              Field of study: {education.fieldOfStudy}
            </p>
            {education.grade && (
              <p className="text-sm text-gray-600">Grade: {education.grade}</p>
            )}
            <p className="text-sm text-gray-500">
              {education.startMonth} {education.startYear} -{" "}
              {education.isCurrentlyStudying ||
              !education.endMonth ||
              !education.endYear
                ? "Present"
                : `${education.endMonth} ${education.endYear}`}
            </p>
          </div>
          {!readOnly && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditClick(education)}
                disabled={isDeleting}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {education.description && (
          <p className="mt-3 text-sm text-gray-700">{education.description}</p>
        )}
      </div>
    </div>
  );
}
