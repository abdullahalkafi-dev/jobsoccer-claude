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
import { Plus, Edit, Award, MapPin, Loader2, Trash2 } from "lucide-react";
import {
  useGetUserExperiencesQuery,
  useDeleteExperienceMutation,
} from "@/redux/features/experience/experienceApi";
import { ExperienceData } from "@/types/experience";
import { toast } from "sonner";
import { useState } from "react";
import AddExperienceModal from "@/components/modals/AddExperienceModal";
import EditExperienceModal from "@/components/modals/EditExperienceModal";

interface ExperienceSectionProps {
  userId: string;
  readOnly?: boolean;
}

export default function ExperienceSection({
  userId,
  readOnly = false,
}: ExperienceSectionProps) {
  const [deleteExperience] = useDeleteExperienceMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editExperienceData, setEditExperienceData] =
    useState<ExperienceData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: experiencesData,
    isLoading: isLoadingExperiences,
    error: experiencesError,
  } = useGetUserExperiencesQuery(userId, {
    skip: !userId,
  });

  const handleDeleteClick = (experienceId: string, clubName: string) => {
    setExperienceToDelete({ id: experienceId, name: clubName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!experienceToDelete) return;

    try {
      const result = await deleteExperience(experienceToDelete.id).unwrap();
      if (result.success) {
        toast.success(result.message || "Experience deleted successfully!");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to delete experience. Please try again."
      );
      console.error("Error deleting experience:", error);
    } finally {
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
    }
  };

  const handleEditClick = (experience: ExperienceData) => {
    setEditExperienceData(experience);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-md md:text-xl">Experience</CardTitle>
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
          {isLoadingExperiences ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : experiencesError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Failed to load experiences</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : !experiencesData?.data || experiencesData.data.length === 0 ? (
            <EmptyExperienceState
              onAddClick={() => setIsAddModalOpen(true)}
              readOnly={readOnly}
            />
          ) : (
            <ExperienceList
              experiences={experiencesData.data}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              readOnly={readOnly}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddExperienceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editExperienceData && (
        <EditExperienceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditExperienceData(null);
          }}
          experienceData={editExperienceData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your experience at{" "}
              <span className="font-semibold">{experienceToDelete?.name}</span>.
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

interface EmptyExperienceStateProps {
  onAddClick: () => void;
  readOnly?: boolean;
}

function EmptyExperienceState({
  onAddClick,
  readOnly = false,
}: EmptyExperienceStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Award className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Experience Added Yet
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {readOnly
          ? "This user hasn't added any experience yet."
          : "Showcase your professional journey by adding your work experience. This helps employers understand your background and expertise."}
      </p>
      {!readOnly && (
        <Button
          onClick={onAddClick}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Experience
        </Button>
      )}
    </div>
  );
}

interface ExperienceListProps {
  experiences: any[];
  onEditClick: (experience: ExperienceData) => void;
  onDeleteClick: (experienceId: string, clubName: string) => void;
  readOnly?: boolean;
}

function ExperienceList({
  experiences,
  onEditClick,
  onDeleteClick,
  readOnly = false,
}: ExperienceListProps) {
  return (
    <div className="space-y-6">
      {experiences.map((exp: any) => (
        <ExperienceItem
          key={exp._id}
          experience={exp}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

interface ExperienceItemProps {
  experience: any;
  onEditClick: (experience: ExperienceData) => void;
  onDeleteClick: (experienceId: string, clubName: string) => void;
  readOnly?: boolean;
}

function ExperienceItem({
  experience,
  onEditClick,
  onDeleteClick,
  readOnly = false,
}: ExperienceItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatEmploymentType = (type: string) => {
    return type.replace(/([A-Z])/g, " $1").trim();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteClick(experience._id, experience.club);
    setIsDeleting(false);
  };

  return (
    <div className="flex space-x-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="shrink-0">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          {experience.club.substring(0, 2).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{experience.club}</h3>
            <p className="text-sm text-gray-600">{experience.title}</p>
            <p className="text-sm text-gray-500">
              {formatEmploymentType(experience.employmentType)}
            </p>
            <p className="text-sm text-gray-500">
              {experience.startMonth} {experience.startYear} -{" "}
              {experience.isCurrentlyWorking
                ? "Present"
                : `${experience.endMonth} ${experience.endYear}`}
            </p>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">
                {experience.location}
              </span>
            </div>
          </div>
          {!readOnly && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditClick(experience)}
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

        <p className="mt-3 text-sm text-gray-700">{experience.description}</p>
      </div>
    </div>
  );
}
