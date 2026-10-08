"use client";

import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users as UsersIcon,
} from "lucide-react";
import { Input } from "../ui/input";
import { useState, useMemo } from "react";
import { Pagination } from "../Shared/Pagination";
import {
  useGetVerificationRequestsQuery,
  useUpdateVerificationStatusMutation,
} from "@/redux/api/baseApi";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  profileId: string | null;
  role: string;
}

interface VerificationRequest {
  _id: string;
  userId: UserInfo;
  userType: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// Utility functions for styling
const getStatusStyle = (status: string): string => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

export function VerificationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const itemsPerPage = 10;

  // Fetch verification requests from API
  const { data, isLoading, isFetching } = useGetVerificationRequestsQuery({
    page: currentPage,
    limit: 9999, // Fetch all for client-side pagination as per API
  });

  const [updateVerificationStatus, { isLoading: isUpdating }] =
    useUpdateVerificationStatusMutation();

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((req: VerificationRequest) => {
        const fullName =
          `${req.userId.firstName} ${req.userId.lastName}`.toLowerCase();
        const email = req.userId.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (req: VerificationRequest) => req.status === statusFilter,
      );
    }

    return filtered;
  }, [data?.data, searchQuery, statusFilter]);

  // Pagination logic
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Handle status update
  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await updateVerificationStatus({ id, status }).unwrap();
      toast.success(`Verification request ${status} successfully`);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : null;
      toast.error(errorMessage || `Failed to ${status} verification request`);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Verification Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage user verification requests
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <UsersIcon className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Total Requests</p>
            <p className="text-lg font-bold text-gray-900">
              {data?.meta?.total || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "" ? "default" : "outline"}
            onClick={() => {
              setStatusFilter("");
              setCurrentPage(1);
            }}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => {
              setStatusFilter("pending");
              setCurrentPage(1);
            }}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            onClick={() => {
              setStatusFilter("approved");
              setCurrentPage(1);
            }}
            size="sm"
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            onClick={() => {
              setStatusFilter("rejected");
              setCurrentPage(1);
            }}
            size="sm"
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isFetching && !isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : paginatedRequests.length === 0 ? (
          <div className="flex flex-col items-center p-4">
            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No verification requests found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery || statusFilter
                ? "Try adjusting your filters"
                : "There are no verification requests yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRequests.map((request: VerificationRequest) => (
                  <tr
                    key={request._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br border flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${request.userId?.profileImage}`}
                            alt={`${request.userId?.firstName}'s profile`}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.userId?.firstName}{" "}
                            {request.userId?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.userId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {request.userId?.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 capitalize">
                        {request.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(request.status)} capitalize`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {request.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleStatusUpdate(request._id, "approved")
                            }
                            disabled={isUpdating}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleStatusUpdate(request._id, "rejected")
                            }
                            disabled={isUpdating}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
