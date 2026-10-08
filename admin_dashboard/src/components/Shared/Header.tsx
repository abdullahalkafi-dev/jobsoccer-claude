"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ProfileDropdown } from "../Modals/ProfileDropdown";
import { LogoutModal } from "../Modals/LogoutModal";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

export function Header({ title }: { title: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setIsLoggingOut(true);

    // Small delay for better UX
    setTimeout(() => {
      dispatch(logout());
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      router.push("/login");
    }, 500);
  };

  return (
    <>
      <header className="h-16 flex shrink-0 items-center gap-2 border-b bg-white px-4">
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
              {title}
            </h1>
          </div>
        </div>
        <div>
          <ProfileDropdown onLogout={handleLogout} />
        </div>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
