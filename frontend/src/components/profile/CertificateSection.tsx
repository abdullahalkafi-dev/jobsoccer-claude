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
import { Plus, Edit, Award, Loader2, Trash2 } from "lucide-react";
import {
  useGetUserCertificatesQuery,
  useDeleteCertificateMutation,
} from "@/redux/features/certificate/certificateApi";
import { CertificateData } from "@/types/certificate";
import { toast } from "sonner";
import { useState } from "react";
import AddLicensesOrCertificationsModal from "@/components/modals/AddLicensesOrCertificationsModal";
import EditLicenseOrCertificationsModal from "@/components/modals/EditLicensesOrCertificationsModal";

interface CertificateSectionProps {
  userId: string;
  readOnly?: boolean;
}

export default function CertificateSection({
  userId,
  readOnly = false,
}: CertificateSectionProps) {
  const [deleteCertificate] = useDeleteCertificateMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCertificateData, setEditCertificateData] =
    useState<CertificateData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: certificatesData,
    isLoading: isLoadingCertificates,
    error: certificatesError,
  } = useGetUserCertificatesQuery(userId, {
    skip: !userId,
  });

  const handleDeleteClick = (certificateId: string, name: string) => {
    setCertificateToDelete({ id: certificateId, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certificateToDelete) return;

    try {
      const result = await deleteCertificate(certificateToDelete.id).unwrap();
      if (result.success) {
        toast.success(result.message || "Certificate deleted successfully!");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to delete certificate. Please try again."
      );
      console.error("Error deleting certificate:", error);
    } finally {
      setDeleteDialogOpen(false);
      setCertificateToDelete(null);
    }
  };

  const handleEditClick = (certificate: CertificateData) => {
    setEditCertificateData(certificate);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-md md:text-xl">
              Licenses and Certifications
            </CardTitle>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Add</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {isLoadingCertificates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : certificatesError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Failed to load certificates</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : !certificatesData?.data || certificatesData.data.length === 0 ? (
            <EmptyCertificateState
              onAddClick={() => setIsAddModalOpen(true)}
              readOnly={readOnly}
            />
          ) : (
            <CertificateList
              certificates={certificatesData.data}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              readOnly={readOnly}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddLicensesOrCertificationsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editCertificateData && (
        <EditLicenseOrCertificationsModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditCertificateData(null);
          }}
          certificationData={editCertificateData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your certificate{" "}
              <span className="font-semibold">{certificateToDelete?.name}</span>
              . This action cannot be undone.
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

interface EmptyCertificateStateProps {
  onAddClick: () => void;
  readOnly?: boolean;
}

function EmptyCertificateState({
  onAddClick,
  readOnly = false,
}: EmptyCertificateStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Award className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Certificates Added Yet
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {readOnly
          ? "This user hasn't added any certificates yet."
          : "Showcase your professional certifications and licenses. This helps employers understand your qualifications and expertise."}
      </p>
      {!readOnly && (
        <Button
          onClick={onAddClick}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Certificate
        </Button>
      )}
    </div>
  );
}

interface CertificateListProps {
  certificates: any[];
  onEditClick: (certificate: CertificateData) => void;
  onDeleteClick: (certificateId: string, name: string) => void;
  readOnly?: boolean;
}

function CertificateList({
  certificates,
  onEditClick,
  onDeleteClick,
  readOnly = false,
}: CertificateListProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {certificates.map((cert: any) => (
        <CertificateItem
          key={cert._id}
          certificate={cert}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

interface CertificateItemProps {
  certificate: any;
  onEditClick: (certificate: CertificateData) => void;
  onDeleteClick: (certificateId: string, name: string) => void;
  readOnly?: boolean;
}

function CertificateItem({
  certificate,
  onEditClick,
  onDeleteClick,
  readOnly = false,
}: CertificateItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteClick(certificate._id, certificate.name);
    setIsDeleting(false);
  };

  // Convert month number to month name
  const getMonthName = (month: string | number) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // If it's already a month name, return it
    if (typeof month === "string" && monthNames.includes(month)) {
      return month;
    }

    // If it's a number or numeric string, convert to month name
    const monthNum = typeof month === "string" ? parseInt(month) : month;
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      return monthNames[monthNum - 1];
    }

    return month;
  };

  const formatDate = () => {
    const startMonth = getMonthName(certificate.startMonth);
    const endMonth = certificate.endMonth
      ? getMonthName(certificate.endMonth)
      : null;

    return `${startMonth} ${certificate.startYear} - ${
      endMonth ? `${endMonth} ${certificate.endYear}` : "Present"
    }`;
  };

  return (
    <div className="flex space-x-3 lg:space-x-4 p-3 lg:p-4 hover:bg-gray-50 transition-colors">
      <div className="shrink-0">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs lg:text-sm">
          {certificate.issuingOrganization.substring(0, 2).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
              {certificate.name}
            </h3>
            <p className="text-xs lg:text-sm text-gray-600">
              {certificate.issuingOrganization}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              {formatDate()}
            </p>

            {certificate.credentialId && (
              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                <span className="font-medium">Credential ID:</span>{" "}
                {certificate.credentialId}
              </p>
            )}

            {certificate.credentialUrl && (
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs lg:text-sm text-blue-600 hover:underline mt-1 inline-block"
              >
                Show credential
              </a>
            )}
          </div>

          {!readOnly && (
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditClick(certificate)}
                disabled={isDeleting}
              >
                <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
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
                  <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {certificate.description && (
          <p className="mt-2 lg:mt-3 text-xs lg:text-sm text-gray-700">
            {certificate.description}
          </p>
        )}
      </div>
    </div>
  );
}
