"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Home,
  MessageCircle,
  Bell,
  Users,
  Building2,
  Briefcase,
  LogIn,
  Crown,
  Menu,
  UserSquare,
  LucideIcon,
  LogOut,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.png";
import NotificationModal from "../modals/NotificationModal";
import LogoutModal from "../modals/LogoutModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useGetMeQuery } from "@/redux/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { baseApi } from "@/redux/api/baseApi";
import { useGetUnreadCountQuery } from "@/redux/features/notification/notificationApi";
import { useNotificationContext } from "@/components/providers/NotificationProvider";
import GoogleTranslate from "../googleTranslate/GoogleTranslate";

// ==================== Types ====================
interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface UserProfileMenuProps {
  profileImageUrl?: string;
  userName?: string;
  userType?: "candidate" | "employer" | "admin";
  onLogout: () => void;
  size?: "sm" | "md";
}

// ==================== Subcomponents ====================
const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  profileImageUrl,
  userName = "U",
  userType,
  onLogout,
  size = "md",
}) => {
  const router = useRouter();
  const avatarSize = size === "sm" ? "w-11 h-11" : "w-13 h-13";

  const handleProfileClick = () => {
    if (userType === "candidate") {
      router.push("/profile/candidate");
    } else if (userType === "employer") {
      router.push("/profile/employer");
    }
    else if (userType === "admin") {
      window.open("http://74.208.193.37:4000/login", "_blank");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-full">
          {profileImageUrl ? (
            <div
              className={`${avatarSize} rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-green-500 transition-colors`}
            >
              <Image
                src={profileImageUrl}
                alt="User Avatar"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Avatar
              className={`${avatarSize} cursor-pointer hover:ring-2 hover:ring-green-500 transition-all`}
            >
              <AvatarFallback className="bg-black text-white text-base font-semibold">
                {userName[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        {userType === "admin" ? (
          <DropdownMenuItem asChild className="cursor-pointer">
            <a
              href="http://74.208.193.37:4000/login"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full"
            >
              <User className="h-4 w-4" />
              Admin Dashboard
            </a>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={handleProfileClick}
            className="cursor-pointer"
          >
            <User className="h-4 w-4" />
            My Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface NavLinkItemProps {
  link: NavLink;
  isActive: boolean;
  onMobileClick?: () => void;
  isMobile?: boolean;
  badge?: number; // For notification count
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({
  link,
  isActive,
  onMobileClick,
  isMobile = false,
  badge,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
    if (onMobileClick) {
      onMobileClick();
    }
  };

  const baseClasses = "transition-colors duration-200";
  const activeClasses = isActive
    ? "text-green-500 font-bold"
    : "text-black hover:text-green-500 font-medium";

  const showBadge = typeof badge === "number" && badge > 0;

  if (isMobile) {
    return (
      <Link
        href={link.href}
        onClick={handleClick}
        className={`flex items-center gap-3 py-2 ${baseClasses} ${activeClasses}`}
      >
        <div className="relative">
          <link.icon className="h-5 w-5" />
          {showBadge && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
        <span className="font-medium">{link.name}</span>
      </Link>
    );
  }

  return (
    <Link
      href={link.href}
      onClick={link.onClick}
      className={`flex flex-col items-center gap-1 relative ${baseClasses} ${activeClasses}`}
    >
      <div className="relative">
        <link.icon className="h-5 w-5" />
        {showBadge && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="text-sm font-medium">{link.name}</span>
    </Link>
  );
};

// ==================== Helpers ====================
const getNavLinks = (
  isLoggedIn: boolean,
  onNotificationClick: () => void,
): NavLink[] => {
  const commonLinks: NavLink[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Candidates", href: "/candidates", icon: Users },
    { name: "Employers", href: "/employers", icon: Building2 },
    { name: "Job Board", href: "/jobs", icon: Briefcase },
  ];

  if (isLoggedIn) {
    return [
      ...commonLinks,
      { name: "My Network", href: "/my-network", icon: UserSquare },
      { name: "Upgrade", href: "/upgrade", icon: Crown },
      { name: "Message", href: "/messages", icon: MessageCircle },
      {
        name: "Notification",
        href: "#",
        icon: Bell,
        onClick: onNotificationClick,
      },
    ];
  }

  return [
    ...commonLinks,
    { name: "Upgrade", href: "/upgrade", icon: Crown },
    { name: "Messages", href: "/messages", icon: MessageCircle },
  ];
};

const getProfileImageUrl = (profileImage?: string): string | undefined => {
  if (!profileImage) return undefined;
  return `${process.env.NEXT_PUBLIC_BASE_URL}${profileImage}`;
};

// ==================== Main Component ====================
export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Check if user has token and details from Redux store
  const token = useAppSelector((state) => state.auth.token);
  const reduxUser = useAppSelector((state) => state.auth.user);
  const hasToken = !!token;

  // Mount logic to avoid Next.js hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, isLoading: isLoadingUser, error: userError } = useGetMeQuery(null, {
    skip: !hasToken,
  });

  // Automatically log out if token is invalid/expired
  useEffect(() => {
    if (userError && typeof userError === "object" && "status" in userError) {
      const status = (userError as { status: number | string }).status;
      if (status === 401 || status === 403) {
        dispatch(logout());
        dispatch(baseApi.util.resetApiState());
      }
    }
  }, [userError, dispatch]);

  // Get real-time unread notification count from context
  const { unreadCount: realtimeUnreadCount } = useNotificationContext();

  // Get unread notification count from API as backup
  const { data: unreadCountData } = useGetUnreadCountQuery(undefined, {
    skip: !hasToken,
    pollingInterval: 60000, // Poll every 60 seconds
  });

  // Use real-time count if available, otherwise fall back to API count
  const unreadCount = realtimeUnreadCount || unreadCountData?.data || 0;

  // Derived Auth state and roles
  const currentUser = user?.data || reduxUser;
  const isLoggedIn = hasToken && !!currentUser;
  const isAdmin = currentUser?.userType === "admin" || currentUser?.role === "admin";
  const userType = isAdmin ? "admin" : currentUser?.userType;

  const navLinks = useMemo(
    () => getNavLinks(isLoggedIn, () => setIsNotificationOpen(true)),
    [isLoggedIn],
  );

  const profileImageUrl = useMemo(
    () => getProfileImageUrl(currentUser?.profileImage || undefined),
    [currentUser?.profileImage],
  );

  const isActiveLink = useCallback(
    (href: string) => {
      if (href === "/") return pathname === href;
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const handleLogoutClick = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const confirmLogout = useCallback(() => {
    // Clear Redux state
    dispatch(logout());
    // Reset RTK Query cache to clear all cached data
    dispatch(baseApi.util.resetApiState());
    setIsLogoutModalOpen(false);
    router.push("/signin");
  }, [dispatch, router]);

  const cancelLogout = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <nav className="bg-yellow-300 sticky top-0 z-50 text-black">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 justify-between py-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center bg-white rounded-full hover:shadow-md transition-shadow"
            aria-label="Job Soccer Home"
          >
            <Image
              src={logo}
              alt="Job Soccer Logo"
              className="w-16 h-auto"
              priority
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden hover:text-green-500 transition-colors p-2 rounded-md hover:bg-white/50"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center justify-center gap-4 lg:gap-8 w-full"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <NavLinkItem
                key={link.name}
                link={link}
                isActive={isActiveLink(link.href)}
                badge={link.name === "Notification" ? unreadCount : undefined}
              />
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex gap-5 justify-end">
            <GoogleTranslate />
            {!mounted ? (
              // Neutral loading placeholder before hydration matching server render
              <Link href="/signin">
                <Button className="bg-black hover:bg-gray-800 text-white font-semibold cursor-pointer">
                  Sign In
                </Button>
              </Link>
            ) : hasToken && isLoadingUser && !currentUser ? (
              // Pulse loader when loading state is active and we don't have redux cached data
              <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
            ) : isLoggedIn ? (
              <UserProfileMenu
                profileImageUrl={profileImageUrl}
                userName={currentUser?.firstName}
                userType={userType}
                onLogout={handleLogoutClick}
                size="sm"
              />
            ) : (
              <Link href="/signin">
                <Button className="bg-black hover:bg-gray-800 hover:scale-105 transition-transform duration-200 text-white font-semibold cursor-pointer">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="border-b">
            <SheetTitle className="text-left">
              {!mounted ? (
                <span className="text-xl font-bold text-gray-900">Menu</span>
              ) : hasToken && isLoadingUser && !currentUser ? (
                <div className="w-13 h-13 rounded-full bg-gray-200 animate-pulse" />
              ) : isLoggedIn ? (
                <UserProfileMenu
                  profileImageUrl={profileImageUrl}
                  userName={currentUser?.firstName}
                  userType={userType}
                  onLogout={handleLogoutClick}
                  size="md"
                />
              ) : (
                <span className="text-xl font-bold text-gray-900">Menu</span>
              )}
            </SheetTitle>
          </SheetHeader>

          <nav
            className="flex flex-col space-y-4 px-4"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <NavLinkItem
                key={link.name}
                link={link}
                isActive={isActiveLink(link.href)}
                onMobileClick={closeMobileMenu}
                isMobile
                badge={link.name === "Notification" ? unreadCount : undefined}
              />
            ))}

            {(!mounted || !isLoggedIn) && (
              <Link
                href="/signin"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 py-2 text-gray-700 hover:text-green-500 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Log in</span>
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </nav>
  );
}
