"use client";

import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import LogoutModal from "@/components/modals/LogoutModal";

const navigationItems = [
  { id: "/", label: "My Profile" },
  { id: "billing", label: "Billing" },
  { id: "jobs", label: "Jobs" },
  { id: "requests", label: "Accept Request" },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);
    router.push("/signin");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Extract active section from pathname
  let activeSection = pathname.replace(/^\/profile\/candidate\/?/, "");
  if (activeSection === "") {
    activeSection = "/";
  } else if (activeSection.includes("/")) {
    activeSection = activeSection.split("/")[0];
  }

  // Responsive sidebar
  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden flex items-center py-4 px-2">
        <Button
          variant="outline"
          className="border-gray-300"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <span className="ml-3 text-lg font-semibold">Profile Menu</span>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="flex md:hidden absolute z-50"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="relative w-64 bg-white border rounded-2xl border-gray-200 shadow-lg h-full flex flex-col animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
            <SidebarContent
              activeSection={activeSection}
              onLogout={handleLogoutClick}
            />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-60 lg:shrink-0 bg-white border rounded-2xl border-gray-200 h-full">
        <SidebarContent
          activeSection={activeSection}
          onLogout={handleLogoutClick}
        />
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}

function SidebarContent({
  activeSection,
  onLogout,
}: {
  activeSection: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-8">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={
                    item.id
                      ? `/profile/candidate/${item.id}`
                      : "/profile/candidate"
                  }
                  className="block"
                >
                  <Button
                    className={cn(
                      "w-full flex justify-start bg-transparent items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-left",
                      isActive
                        ? "bg-yellow-300 text-black shadow"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
