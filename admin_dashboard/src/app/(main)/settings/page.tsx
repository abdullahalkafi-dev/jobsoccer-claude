/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Pencil } from "lucide-react";
import EditUserInfoModal, {
  UserInfoData,
} from "@/components/Modals/EditUserInfoModal";
import ChangePasswordModal, {
  PasswordData,
} from "@/components/Modals/ChangePasswordModal";
import { useAppSelector } from "@/redux/hooks";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} from "@/redux/api/baseApi";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const { refetch } = useGetMeQuery(undefined);

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handleSaveUserInfo = async (data: UserInfoData, imageFile?: File) => {
    try {
      const formData = new FormData();

      // Append image if provided
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Append data as JSON string as required by the API
      formData.append(
        "data",
        JSON.stringify({ firstName: data.firstName, lastName: data.lastName }),
      );

      const response = await updateProfile({
        id: user!._id,
        formData,
      }).unwrap();

      // Update Redux with the user from response
      if (response?.data) {
        dispatch(setUser(response.data));
      }

      // Refetch user data to ensure sync
      await refetch();

      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handleSavePassword = async (data: PasswordData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      setIsPasswordModalOpen(false);
      toast.success("Password changed successfully!");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  console.log("User data in SettingsPage:", user);
  return (
    <main className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Personal Information
        </h1>
        <Button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-lg px-6"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card - Left Side */}
        <div className="shrink-0">
          <div className="w-52 rounded-2xl border-2 border-primary/30 p-6 bg-card flex flex-col items-center">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full overflow-hidden bg-muted mb-4">
              {user?.profileImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profileImage}`}
                  alt={`${user?.firstName}'s Profile`}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {(user?.firstName?.charAt(0) || "A").toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Admin Label */}
            <span className="text-sm font-medium text-muted-foreground mb-1">
              Admin
            </span>

            {/* Name */}
            <span className="text-xl font-semibold text-foreground">
              {user?.firstName || "Admin"}
            </span>
          </div>
        </div>

        {/* Information Fields - Right Side */}
        <div className="flex-1 space-y-4">
          {/* Full Name Field */}
          <div className="bg-card rounded-lg px-4 py-3 border border-border">
            <p className="text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          {/* Email Field */}
          <div className="bg-card rounded-lg px-4 py-3 border border-border">
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          {/* Change Password Button */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center justify-between bg-card hover:bg-muted/50 transition-colors rounded-lg px-4 py-3 border border-border group"
          >
            <span className="text-foreground">Change password</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditUserInfoModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleSaveUserInfo}
        initialData={{
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          avatar: user?.profileImage
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profileImage}`
            : "",
        }}
        isLoading={isUpdatingProfile}
      />

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        onSave={handleSavePassword}
        isLoading={isChangingPassword}
      />
    </main>
  );
}
