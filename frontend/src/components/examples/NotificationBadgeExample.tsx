/**
 * Example: How to use the NotificationBadge in your navbar/header
 *
 * This file shows different ways to integrate the notification system
 */

"use client";

import NotificationBadge from "@/components/shared/NotificationBadge";
import { useRouter } from "next/navigation";

// OPTION 1: With Dropdown (Recommended)
// This shows a dropdown with recent notifications
export function NavbarWithDropdown() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Job Soccer</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Badge with Dropdown */}
          <NotificationBadge showDropdown={true} />

          {/* Other nav items */}
          <button className="p-2">Profile</button>
        </div>
      </nav>
    </header>
  );
}

// OPTION 2: Navigate to Full Page
// This redirects to /notification page
export function NavbarWithNavigation() {
  const router = useRouter();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Job Soccer</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Badge that navigates */}
          <NotificationBadge onClick={() => router.push("/notification")} />

          {/* Other nav items */}
          <button className="p-2">Profile</button>
        </div>
      </nav>
    </header>
  );
}

// OPTION 3: Custom Handler
// You can also implement your own custom behavior
export function NavbarWithCustomHandler() {
  const handleNotificationClick = () => {
    // Your custom logic here
    console.log("Notification clicked!");
    // Could open a modal, navigate, etc.
  };

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Job Soccer</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Badge with custom handler */}
          <NotificationBadge onClick={handleNotificationClick} />

          {/* Other nav items */}
          <button className="p-2">Profile</button>
        </div>
      </nav>
    </header>
  );
}

// Default export - use the dropdown version
export default NavbarWithDropdown;
