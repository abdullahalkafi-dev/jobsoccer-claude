import ProfileSidebar from "@/components/sidebars/ProfileSidebar";
import { RoleGuard } from "@/components/shared/RoleGuard";
import React from "react";

function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="candidate">
      <div className="container mx-auto px-4 md:flex md:min-h-screen gap-6 md:py-10">
        <ProfileSidebar />
        {children}
      </div>
    </RoleGuard>
  );
}

export default ProfileLayout;
