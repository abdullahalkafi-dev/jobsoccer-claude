/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetUserDetailsQuery } from "@/redux/api/baseApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Video,
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  GraduationCap,
  FileText,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { useMemo } from "react";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}

// Utility function for date formatting
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Info Item Component
function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="shrink-0 text-gray-500 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 wrap-break-word">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
      <h4 className="text-lg font-bold text-gray-900">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({count})
          </span>
        )}
      </h4>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "purple" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    green: "bg-green-50 border-green-200",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };

  const textColorClasses = {
    blue: "text-blue-700",
    purple: "text-purple-700",
    green: "text-green-700",
  };

  return (
    <div
      className={`text-center p-4 rounded-xl border-2 ${colorClasses[color]} transition-transform hover:scale-105`}
    >
      <div className={`inline-flex mb-2 ${iconColorClasses[color]}`}>{icon}</div>
      <p className={`text-3xl font-bold ${textColorClasses[color]} mb-1`}>
        {value}
      </p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

export function UserDetailsModal({
  isOpen,
  onClose,
  userId,
}: UserDetailsModalProps) {
  const { data, isLoading, error } = useGetUserDetailsQuery(userId, {
    skip: !userId || !isOpen,
  });

  const user = useMemo(() => data?.data, [data]);

  // Loading State
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading User Details...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error State
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md!">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Details
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn&apos;t load the user details. Please try again.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No Data State
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md!">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600">User information not found.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            User Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start p-6 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            {/* Profile Image */}
            <div className="shrink-0">
              {user.profileImage ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profileImage}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ID: {user._id}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 border border-blue-200"
                >
                  <User className="w-3 h-3 mr-1" />
                  {user.userType}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 border border-purple-200"
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  {user.role}
                </Badge>
                {user.isVerified && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 border border-green-200"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          {user.profile && (
            <>
              <div>
                <SectionHeader
                  icon={<User className="w-5 h-5 text-blue-600" />}
                  title="Personal Information"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Date of Birth"
                    value={formatDate(user.profile.dateOfBirth)}
                  />
                  <InfoItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Place of Birth"
                    value={user.profile.placeOfBirth}
                  />
                  <InfoItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Nationality"
                    value={user.profile.nationality}
                  />
                  <InfoItem
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                    value={user.profile.phoneNumber}
                  />
                  <InfoItem
                    icon={<User className="w-4 h-4" />}
                    label="Gender"
                    value={user.profile.gender}
                  />
                  <InfoItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Country"
                    value={user.profile.country}
                  />
                  <InfoItem
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Height"
                    value={
                      user.profile.height
                        ? `${user.profile.height.size} ${user.profile.height.unit}`
                        : "N/A"
                    }
                  />
                  <InfoItem
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Weight"
                    value={
                      user.profile.weight
                        ? `${user.profile.weight.size} ${user.profile.weight.unit}`
                        : "N/A"
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Career Information */}
              <div>
                <SectionHeader
                  icon={<Briefcase className="w-5 h-5 text-blue-600" />}
                  title="Career Information"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoItem
                    icon={<Users className="w-4 h-4" />}
                    label="Current Club"
                    value={user.profile.currentClub}
                  />
                  <InfoItem
                    icon={<Award className="w-4 h-4" />}
                    label="Position"
                    value={user.profile.position}
                  />
                  <InfoItem
                    icon={<Award className="w-4 h-4" />}
                    label="Division"
                    value={user.profile.division}
                  />
                  <InfoItem
                    icon={<User className="w-4 h-4" />}
                    label="Preferred Foot"
                    value={user.profile.foot}
                  />
                  <InfoItem
                    icon={<Users className="w-4 h-4" />}
                    label="Agent"
                    value={user.profile.agent}
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Contract Expires"
                    value={user.profile.contractExpires}
                  />
                  <InfoItem
                    icon={<Award className="w-4 h-4" />}
                    label="National Team Category"
                    value={user.profile.nationalTeamCategory}
                  />
                  <InfoItem
                    icon={<Award className="w-4 h-4" />}
                    label="National Team Games"
                    value={user.profile.nationalTeamGames}
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Availability"
                    value={user.profile.availability}
                  />
                  <InfoItem
                    icon={<Users className="w-4 h-4" />}
                    label="Teams Joined"
                    value={user.profile.teamsJoined}
                  />
                </div>
              </div>

              {/* Videos */}
              {user.profile.videos && user.profile.videos.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <SectionHeader
                      icon={<Video className="w-5 h-5 text-blue-600" />}
                      title="Videos"
                      count={user.profile.videos.length}
                    />
                    <div className="space-y-2">
                      {user.profile.videos.map((video: any, index: number) => (
                        <div
                          key={video._id}
                          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Video className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {video.title || `Video ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                Uploaded: {formatDate(video.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <Separator />

          {/* Account Information */}
          <div>
            <SectionHeader
              icon={<Shield className="w-5 h-5 text-blue-600" />}
              title="Account Information"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Account Created"
                value={formatDate(user.createdAt)}
              />
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Last Updated"
                value={formatDate(user.updatedAt)}
              />
              <InfoItem
                icon={
                  user.isVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )
                }
                label="Email Verification"
                value={user.isVerified ? "Verified" : "Not Verified"}
              />
              <InfoItem
                icon={
                  user.isDeleted ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )
                }
                label="Account Status"
                value={user.isDeleted ? "Deleted" : "Active"}
              />
            </div>
          </div>

          {/* Statistics Cards */}
          {(user.educations?.length > 0 ||
            user.experiences?.length > 0 ||
            user.certifications?.length > 0) && (
            <>
              <Separator />
              <div>
                <SectionHeader
                  icon={<Award className="w-5 h-5 text-blue-600" />}
                  title="Achievements & Credentials"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    icon={<GraduationCap className="w-6 h-6" />}
                    label="Education"
                    value={user.educations?.length || 0}
                    color="blue"
                  />
                  <StatCard
                    icon={<Briefcase className="w-6 h-6" />}
                    label="Experience"
                    value={user.experiences?.length || 0}
                    color="purple"
                  />
                  <StatCard
                    icon={<FileText className="w-6 h-6" />}
                    label="Certifications"
                    value={user.certifications?.length || 0}
                    color="green"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
