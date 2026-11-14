"use client";

import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import LogoutModal from "@/components/modals/LogoutModal";
import { useTranslations } from "next-intl";

type NavigationItem = {
  id: string;
  labelKey: string;
};

const navigationItems: NavigationItem[] = [
  { id: "/", labelKey: "myProfile" },
  { id: "billing", labelKey: "billing" },
  { id: "jobs", labelKey: "jobs" },
  { id: "shortlist", labelKey: "shortlist" },
  { id: "hiring", labelKey: "hiring" },
];

export default function EmployerSidebar() {
  const t = useTranslations("profile.sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  // Filter navigation items based on user role
  const filteredNavigationItems = useMemo(() => {
    if (user?.role === "Agent") {
      // Agent sees: My Profile, Billing, Shortlist, Hiring (no Jobs)
      return navigationItems.filter((item) => item.id !== "jobs");
    }
    // Non-agents see all except Hiring
    return navigationItems.filter((item) => item.id !== "hiring");
  }, [user?.role]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogoutClick = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);
    router.push("/signin");
  };

  // Extract active section from pathname
  let activeSection = pathname.replace(/^\/profile\/employer\/?/, "");
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
        <span className="ml-3 text-lg font-semibold">{t("menu")}</span>
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
              aria-label={t("close")}
            >
              <X className="h-6 w-6" />
            </button>
            <SidebarContent
              activeSection={activeSection}
              navigationItems={filteredNavigationItems}
              onLogout={handleLogoutClick}
            />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-60 shrink-0 bg-white border rounded-2xl border-gray-200 h-full">
        <SidebarContent
          activeSection={activeSection}
          navigationItems={filteredNavigationItems}
          onLogout={handleLogoutClick}
        />
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}

function SidebarContent({
  activeSection,
  navigationItems,
  onLogout,
}: {
  activeSection: string;
  navigationItems: NavigationItem[];
  onLogout: () => void;
}) {
  const t = useTranslations("profile.sidebar");
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
                      ? `/profile/employer/${item.id}`
                      : "/profile/employer"
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
                    {t(item.labelKey)}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
