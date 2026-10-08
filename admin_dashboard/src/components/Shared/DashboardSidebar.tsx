"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  BadgeCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import { LogoutModal } from "@/components/Modals/LogoutModal";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/verifications", label: "Verifications", icon: BadgeCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Simulate a brief delay for better UX
    setTimeout(() => {
      dispatch(logout());
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      router.push("/login");
    }, 500);
  };

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header - User Profile */}
      <SidebarHeader className="border-sidebar-border">
        <div className="py-1 ">
          <div className={`flex items-center gap-3`}>
            <div
              className={`flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? "h-12" : "h-12"}`}
            >
              <Image
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content - Navigation Links */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href + "/"));

                return (
                  <SidebarMenuItem key={link.href} className="h-10">
                    <SidebarMenuButton
                      size="default"
                      asChild
                      isActive={isActive}
                      tooltip={link.label}
                      className={
                        isActive ? "bg-primary! h-full text-white!" : "h-full"
                      }
                    >
                      <Link href={link.href} className="min-w-9">
                        <Icon className="w-5! h-5!" />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer - Logout Button */}
      <SidebarFooter className="px-2 py-4">
        <Button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600"
          size={isCollapsed ? "icon" : "default"}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Log Out</span>}
        </Button>
      </SidebarFooter>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </Sidebar>
  );
}
