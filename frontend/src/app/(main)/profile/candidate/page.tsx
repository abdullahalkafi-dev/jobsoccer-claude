"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Award,
  Upload,
  Mail,
  BadgeCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";
import { useFormats } from "@/i18n/format";
import {
  useUpdateProfileImageMutation,
  useUpdateBannerImageMutation,
} from "@/redux/features/user/userApi";
import { useRequestAdminVerificationMutation } from "@/redux/features/adminVerification/adminVerificationApi";
import UploadResumeModal from "@/components/modals/UploadResumeModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import EditPlayerDetailsModal from "@/components/modals/EditPlayerDetailsModal";
import { useAppSelector } from "@/redux/hooks";
import { ProfileSkeleton } from "@/components/skeleton";
import ExperienceSection from "@/components/profile/ExperienceSection";
import CertificateSection from "@/components/profile/CertificateSection";
import EducationSection from "@/components/profile/EducationSection";
import { VideoManager } from "@/features/video/VideoUploadStep";
import { ProfileQualityCard } from "@/features/profileQuality/ProfileQualityCard";
import { useLiveCandidateEvents } from "@/features/video/useLiveCandidateEvents";
import { useNotificationContext } from "@/components/providers/NotificationProvider";
import ProfileBanner from "@/components/profile/ProfileBanner";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import AnalyticsSection from "@/components/profile/AnalyticsSection";
import InterviewAssessmentCard from "@/components/ai/InterviewAssessmentCard";
import { useGetMyAssessmentQuery } from "@/redux/features/aiEvaluation/aiEvaluationApi";

export default function MyProfilePage() {
  const t = useTranslations("profile");
  const label = useOptionLabel();
  const f = useFormats();
  // Live updates: videos, assessment progress and the score refresh by themselves
  useLiveCandidateEvents();
  const { connected: liveConnected } = useNotificationContext();
  // Get user data from Redux store
  const currentUser = useAppSelector((state) => state.auth.user);

  // Interview assessment (client scoring guide) for on-field staff; refreshes while it is being prepared
  // Interview assessment applies to on-field and office staff
  const isOnFieldStaff = currentUser?.role === "On field staff" || currentUser?.role === "Office Staff";
  const [assessmentPolling, setAssessmentPolling] = useState(0);
  const { data: assessment, isLoading: isLoadingAssessment } = useGetMyAssessmentQuery(undefined, {
    skip: !isOnFieldStaff,
    pollingInterval: assessmentPolling,
  });
  useEffect(() => {
    // The live connection pushes every assessment step; check every 15 s only while it is down
    const inProgress = assessment?.pending && assessment.pending.status !== "failed";
    setAssessmentPolling(inProgress && !liveConnected ? 15000 : 0);
  }, [assessment?.pending, liveConnected]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditPlayerDetailsModalOpen, setIsPlayerDetailsModalOpen] =
    useState(false);

  // API mutations
  const [updateProfileImage, { isLoading: isUpdatingProfile }] =
    useUpdateProfileImageMutation();
  const [updateBannerImage, { isLoading: isUpdatingBanner }] =
    useUpdateBannerImageMutation();
  const [requestAdminVerification, { isLoading: isRequestingVerification }] =
    useRequestAdminVerificationMutation();

  // Handler for profile image update
  const handleProfileImageUpdate = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      await updateProfileImage(formData).unwrap();
      toast.success(t("page.profileImageUpdated"));
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage || t("page.profileImageFailed"));
      throw error; // Re-throw to let component handle cleanup
    }
  };

  // Handler for banner image update
  const handleBannerImageUpdate = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("banner", file);

      await updateBannerImage(formData).unwrap();
      toast.success(t("page.bannerUpdated"));
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage || t("page.bannerFailed"));
      throw error; // Re-throw to let component handle cleanup
    }
  };

  // Handler for admin verification request
  const handleRequestVerification = async () => {
    try {
      await requestAdminVerification().unwrap();
      toast.success(t("page.verificationSubmitted"));
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage || t("page.verificationFailed"));
    }
  };

  // Get verification status
  const verificationStatus = currentUser?.adminVerificationStatus;

  // Render verification badge button based on status
  const renderVerificationBadge = () => {
    // Don't show button when verified - badge is shown next to name
    if (verificationStatus?.status === "approved") {
      return null;
    }

    if (
      verificationStatus?.status === "pending" ||
      verificationStatus?.hasRequest
    ) {
      return (
        <Button
          variant="outline"
          className="bg-yellow-50 border-yellow-200 text-yellow-700 cursor-default"
        >
          <Clock size={20} height={20} /> {t("page.verificationPending")}
        </Button>
      );
    }

    if (verificationStatus?.status === "rejected") {
      return (
        <Button
          variant="outline"
          className="bg-red-50 border-red-200 text-red-700"
          onClick={handleRequestVerification}
          disabled={isRequestingVerification}
        >
          <XCircle size={20} height={20} />{" "}
          {isRequestingVerification ? t("page.requesting") : t("page.requestAgain")}
        </Button>
      );
    }

    // Default: No request yet
    return (
      <Button
        variant="outline"
        onClick={handleRequestVerification}
        disabled={isRequestingVerification}
      >
        <Award size={20} height={20} />{" "}
        {isRequestingVerification ? t("page.requesting") : t("page.addVerificationBadge")}
      </Button>
    );
  };

  // Prepare display data from Redux store
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : t("page.fallbackUser");

  const displayAvatar = currentUser?.profileImage
    ? `${BASE_URL}${currentUser.profileImage}`
    : null;

  const displayBanner = currentUser?.bannerImage
    ? `${BASE_URL}${currentUser.bannerImage}`
    : null;

  const displayRole = label("role", currentUser?.role);

  // Show the skeleton only until the signed-in user is known (no artificial wait)
  if (!currentUser) {
    return <ProfileSkeleton embedded />;
  }

  return (
    // flex-1 + min-w-0: take all the space next to the sidebar from the first frame, so the page
    // does not start narrow and stretch as each section loads
    <div className="px-4 flex-1 min-w-0 w-full">
      {/* Banner and Profile Picture Section */}
      <div className="relative mb-8">
        <ProfileBanner
          bannerUrl={displayBanner}
          onBannerUpdate={handleBannerImageUpdate}
          isUpdating={isUpdatingBanner}
        />
        <ProfileAvatar
          avatarUrl={displayAvatar}
          displayName={displayName}
          onAvatarUpdate={handleProfileImageUpdate}
          isUpdating={isUpdatingProfile}
        />
      </div>

      {/* Profile Info */}
      <div className="mt-20 mb-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {displayName}
            {verificationStatus?.status === "approved" && (
              <BadgeCheck className="h-6 w-6 text-blue-500" />
            )}
          </h2>

          {/* Contact Information */}
          <div className="flex flex-wrap gap-4 mt-2 mb-4 text-gray-600">
            {currentUser?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{currentUser.email}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap mt-4">
            {displayRole && (
              <Badge className="bg-yellow-300 border-yellow-200 px-4 h-9 rounded-md">
                {displayRole}
              </Badge>
            )}
            {renderVerificationBadge()}
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload size={20} height={20} />
              {t("page.uploadResume")}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border rounded-2xl shadow">
        {/* ------------------------Profile  Information Section------------------- */}
        <div className="bg-white rounded-lg border shadow border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md md:text-xl font-semibold text-gray-900">
              {t("page.profileInformation")}
            </h2>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsEditProfileModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                {t("page.edit")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Personal Information Fields */}
            {currentUser?.profile?.position && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.position")}
                </label>
                <p className="text-gray-900 font-medium">
                  {label("position", currentUser.profile.position)}
                </p>
              </div>
            )}

            {currentUser?.profile?.dateOfBirth && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.dateOfBirth")}
                </label>
                <p className="text-gray-900 font-medium">
                  {f.dateLong(currentUser.profile.dateOfBirth)}
                </p>
              </div>
            )}

            {currentUser?.profile?.placeOfBirth && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.placeOfBirth")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.placeOfBirth}
                </p>
              </div>
            )}

            {currentUser?.profile?.nationality && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.nationality")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.nationality}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                {t("fields.phoneNumber")}
              </label>
              <p className="text-gray-900 font-medium">
                {currentUser?.profile?.phoneNumber
                  ? currentUser.profile.phoneNumber
                  : t("page.notAvailable")}
              </p>
            </div>

            {/* Professional Information Fields */}
            {currentUser?.profile?.gender && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.gender")}
                </label>
                <p className="text-gray-900 font-medium">
                  {label("gender", currentUser.profile.gender)}
                </p>
              </div>
            )}

            {currentUser?.profile?.height && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.height")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.height.size}{" "}
                  {label("unit", currentUser.profile.height.unit)}
                </p>
              </div>
            )}

            {currentUser?.profile?.weight && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.weight")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.weight.size}{" "}
                  {label("unit", currentUser.profile.weight.unit)}
                </p>
              </div>
            )}

            {currentUser?.profile?.currentClub && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.currentClub")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.currentClub}
                </p>
              </div>
            )}

            {currentUser?.profile?.availability && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.availableFrom")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.availability}
                </p>
              </div>
            )}

            {currentUser?.profile?.foot && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t("fields.foot")}</label>
                <p className="text-gray-900 font-medium">
                  {label("foot", currentUser.profile.foot)}
                </p>
              </div>
            )}

            {currentUser?.profile?.league && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.league")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.league}
                </p>
              </div>
            )}

            {currentUser?.profile?.country && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.country")}
                </label>
                <p className="text-gray-900 font-medium">
                  {label("country", currentUser.profile.country)}
                </p>
              </div>
            )}

            {currentUser?.profile?.agent && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.agent")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.agent}
                </p>
              </div>
            )}

            {currentUser?.profile?.socialMedia && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.socialMedia")}
                </label>
                <p className="text-blue-600 font-medium cursor-pointer hover:underline break-all">
                  {currentUser.profile.socialMedia}
                </p>
              </div>
            )}

            {/* Professional Player specific fields */}
            {currentUser?.profile?.contractExpires && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.contractExpires")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.contractExpires}
                </p>
              </div>
            )}

            {currentUser?.profile?.division && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.division")}
                </label>
                <p className="text-gray-900 font-medium">
                  {label("division", currentUser.profile.division)}
                </p>
              </div>
            )}

            {currentUser?.profile?.nationalTeamCategory && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.nationalTeamCategory")}
                </label>
                <p className="text-gray-900 font-medium">
                  {label("category", currentUser.profile.nationalTeamCategory)}
                </p>
              </div>
            )}

            {currentUser?.profile?.nationalTeamGames && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.nationalTeamGames")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.nationalTeamGames}
                </p>
              </div>
            )}

            {currentUser?.profile?.teamsJoined && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.teamsJoined")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.teamsJoined}
                </p>
              </div>
            )}

            {/* College/High School specific fields */}
            {currentUser?.profile?.schoolName && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.schoolName")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.schoolName}
                </p>
              </div>
            )}

            {currentUser?.profile?.collegeOrUniversity && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.collegeUniversity")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.collegeOrUniversity}
                </p>
              </div>
            )}

            {currentUser?.profile?.diploma && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.diploma")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.diploma}
                </p>
              </div>
            )}

            {currentUser?.profile?.gpa && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t("fields.gpa")}</label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.gpa}
                </p>
              </div>
            )}

            {currentUser?.profile?.satOrAct && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.satOrAct")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.satOrAct}
                </p>
              </div>
            )}

            {currentUser?.profile?.category && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.category")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.category}
                </p>
              </div>
            )}

            {/* Office Staff specific fields */}
            {currentUser?.profile?.languages && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  {t("fields.languages")}
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.languages}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------Profile Quality (rules + AI, with improvement actions)----------------------- */}
        <div className="mt-6">
          <ProfileQualityCard />
        </div>

        {/* -------------------------Interview Assessment----------------------- */}
        {isOnFieldStaff && (
          <div className="mt-6">
            <InterviewAssessmentCard
              data={assessment}
              isLoading={isLoadingAssessment}
              emptyText={t("page.assessmentEmpty")}
            />
          </div>
        )}

        {/* -------------------------Analytics----------------------- */}
        <AnalyticsSection />

        {/* ------------------ Experience, Certificate, Education, and Video Sections --------------------*/}
        <ExperienceSection userId={currentUser?._id || ""} />
        <CertificateSection userId={currentUser?._id || ""} />
        <EducationSection userId={currentUser?._id || ""} />
        <h2 className="text-xl font-semibold text-gray-900">{t("page.myVideos")}</h2>
        <VideoManager />
      </div>

      {/* ------------------Modals --------------------*/}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        mode="profile"
      />
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        initialData={currentUser?.profile || {}}
        userRole={currentUser?.role || ""}
        userType={currentUser?.userType || "candidate"}
      />
      <EditPlayerDetailsModal
        isOpen={isEditPlayerDetailsModalOpen}
        onClose={() => setIsPlayerDetailsModalOpen(false)}
        initialData={currentUser?.profile || {}}
      />
    </div>
  );
}
