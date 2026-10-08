"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface EditUserInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UserInfoData, imageFile?: File) => void;
  initialData?: UserInfoData;
  isLoading?: boolean;
}

export interface UserInfoData {
  firstName: string;
  lastName: string;
  avatar?: string;
}

export default function EditUserInfoModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isLoading = false,
}: EditUserInfoModalProps) {
  const [formData, setFormData] = useState<UserInfoData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    avatar: initialData?.avatar || "",
  });
  const [previewImage, setPreviewImage] = useState<string>(
    initialData?.avatar || "",
  );
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setFormData({
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        avatar: initialData?.avatar || "",
      });
      setPreviewImage(initialData?.avatar || "");
      setImageFile(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData, imageFile);
  };

  const handleCancel = () => {
    setFormData({
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      avatar: initialData?.avatar || "",
    });
    setPreviewImage(initialData?.avatar || "");
    setImageFile(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            Edit Account Info
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground pt-1">
            Make changes to your profile here. Click save when you&apos;re done.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-semibold text-primary">
                      {formData.firstName.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          {/* First Name Input */}
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-foreground"
            >
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* Last Name Input */}
          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-foreground"
            >
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.firstName || !formData.lastName || isLoading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
