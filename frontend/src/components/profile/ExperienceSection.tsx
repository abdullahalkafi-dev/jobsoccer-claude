/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentProof } from "@/features/verification/DocumentProof";
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
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
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
  const t = useTranslations("profile");
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
        toast.success(result.message || t("experience.deleted"));
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("experience.deleteFailed")
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
            <CardTitle className="text-md md:text-xl">{t("experience.title")}</CardTitle>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("common.add")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {isLoadingExperiences ? (
            // Same height as a filled section, so the page does not jump when the list arrives
            <div className="flex items-center justify-center h-72">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : experiencesError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">{t("experience.loadError")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                {t("common.tryAgain")}
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
            <AlertDialogTitle>{t("common.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.rich("experience.deleteDesc", {
                name: experienceToDelete?.name ?? "",
                b: (chunks) => <span className="font-semibold">{chunks}</span>,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white"
            >
              {t("common.delete")}
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
  const t = useTranslations("profile.experience");
  return (
    <div className="text-center py-5 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Award className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t("emptyTitle")}
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {readOnly
          ? t("emptyReadOnly")
          : t("emptyOwner")}
      </p>
      {!readOnly && (
        <Button
          onClick={onAddClick}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addFirst")}
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
  const t = useTranslations("profile");
  const label = useOptionLabel();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatEmploymentType = (type: string) => {
    return t.has(`employmentTypes.${type}`)
      ? t(`employmentTypes.${type}`)
      : type.replace(/([A-Z])/g, " $1").trim();
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
              {t("common.dateRange", {
                start: `${label("month", experience.startMonth)} ${experience.startYear}`,
                end: experience.isCurrentlyWorking
                  ? t("common.present")
                  : `${label("month", experience.endMonth)} ${experience.endYear}`,
              })}
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
        <DocumentProof type="experience" record={experience} readOnly={readOnly} />
      </div>
    </div>
  );
}
