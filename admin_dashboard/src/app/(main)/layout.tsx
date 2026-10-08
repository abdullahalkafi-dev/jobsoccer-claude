import React from "react";
import { DashboardSidebar } from "@/components/Shared/DashboardSidebar";
import { Header } from "@/components/Shared/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthInitializer } from "@/components/Auth/AuthInitializer";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInitializer />
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <Header title="Admin Dashboard" />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default MainLayout;
