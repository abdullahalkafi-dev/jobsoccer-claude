"use client";

import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

type NavigationItem = {
  id: string;
  label: string;
};

const navigationItems: NavigationItem[] = [
  { id: "/", label: "My Profile" },
  { id: "billing", label: "Billing" },
  { id: "jobs", label: "Jobs" },
  { id: "shortlist", label: "Shortlist" },
  { id: "hiring", label: "Hiring" },
];

export default function EmployerSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
              navigationItems={filteredNavigationItems}
            />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-60 lg:shrink-0 bg-white border rounded-2xl border-gray-200 h-full">
        <SidebarContent
          activeSection={activeSection}
          navigationItems={filteredNavigationItems}
        />
      </div>
    </>
  );
}

function SidebarContent({
  activeSection,
  navigationItems,
}: {
  activeSection: string;
  navigationItems: NavigationItem[];
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
        <button
          onClick={() => console.log("Logout clicked")}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
