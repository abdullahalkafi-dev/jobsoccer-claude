import EmployerSidebar from "@/components/sidebars/EmployerSidebar";
import React from "react";

function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 md:flex md:min-h-screen gap-6 md:py-10">
      <EmployerSidebar />
      {children}
    </div>
  );
}

export default ProfileLayout;
