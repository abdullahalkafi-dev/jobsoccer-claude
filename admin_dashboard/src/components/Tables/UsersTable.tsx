"use client";

import { Search, Filter, X, Users as UsersIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useState, useMemo, useCallback } from "react";
import { Pagination } from "../Shared/Pagination";
import { FiEye } from "react-icons/fi";
import { useGetUserListQuery } from "@/redux/api/baseApi";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserDetailsModal } from "../Modals/UserDetailsModal";
import { Button } from "../ui/button";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userType: "candidate" | "employer";
  createdAt: string;
  subscriptionStatus: "free" | "premium";
  name: string;
}

// Utility functions for styling
const getStatusStyle = (status: string): string => {
  const styles: Record<string, string> = {
    free: "bg-gray-100 text-gray-700 border-gray-200",
    premium: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200",
  };
  return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getUserTypeStyle = (userType: string): string => {
  const styles: Record<string, string> = {
    candidate: "bg-blue-50 text-blue-700 border-blue-200",
    employer: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return styles[userType] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

export function UsersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10;

  // Fetch users from API
  const { data, isLoading, isFetching, error } = useGetUserListQuery({
    email: searchQuery || undefined,
    limit: itemsPerPage,
    page: currentPage,
    subscriptionType: subscriptionFilter || undefined,
    userType: userTypeFilter || undefined,
  });

  // Memoized values
  const users = useMemo(() => data?.data?.users || [], [data]);
  const pagination = useMemo(
    () =>
      data?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10,
      },
    [data]
  );

  const hasActiveFilters = useMemo(
    () => searchQuery || userTypeFilter || subscriptionFilter,
    [searchQuery, userTypeFilter, subscriptionFilter]
  );

  // Event handlers with useCallback for optimization
  const handleViewDetails = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleUserTypeFilter = useCallback((value: string) => {
    setUserTypeFilter(value === "all" ? "" : value);
    setCurrentPage(1);
  }, []);

  const handleSubscriptionFilter = useCallback((value: string) => {
    setSubscriptionFilter(value === "all" ? "" : value);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setUserTypeFilter("");
    setSubscriptionFilter("");
    setCurrentPage(1);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Users
          </h3>
          <p className="text-gray-600">
            We couldn&apos;t load the user data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
        <div className="space-y-6">
          {/* Title and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  User Management
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {pagination.totalUsers} total users
                </p>
              </div>
            </div>
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                aria-label="Search users by email"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              <span>Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-3 flex-1">
              <Select
                value={userTypeFilter || "all"}
                onValueChange={handleUserTypeFilter}
              >
                <SelectTrigger className="h-10 border-gray-300">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All User Types</SelectItem>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={subscriptionFilter || "all"}
                onValueChange={handleSubscriptionFilter}
              >
                <SelectTrigger className="h-10 border-gray-300">
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-10 text-gray-600 hover:text-gray-900 border-gray-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isFetching ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="px-6 py-4" colSpan={7}>
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user: User) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {user._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${getUserTypeStyle(
                        user.userType
                      )}`}
                    >
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusStyle(
                        user.subscriptionStatus
                      )}`}
                    >
                      {user.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewDetails(user._id)}
                      className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                      aria-label={`View details for ${user.name}`}
                      title="View Details"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <UsersIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      No users found
                    </h3>
                    <p className="text-sm text-gray-500">
                      {hasActiveFilters
                        ? "Try adjusting your filters"
                        : "No users available"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden divide-y divide-gray-200">
        {isFetching ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="p-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ))
        ) : users.length > 0 ? (
          users.map((user: User) => (
            <div
              key={user._id}
              className="p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${getUserTypeStyle(
                        user.userType
                      )}`}
                    >
                      {user.userType}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${getStatusStyle(
                        user.subscriptionStatus
                      )}`}
                    >
                      {user.subscriptionStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-900 font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Joined:</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handleViewDetails(user._id)}
                variant="outline"
                size="sm"
                className="w-full h-9 text-sm font-medium"
              >
                <FiEye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                No users found
              </h3>
              <p className="text-sm text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "No users available"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {users.length > 0 && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userId={selectedUserId}
        />
      )}
    </div>
  );
}
