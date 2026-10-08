"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyProfileViewsQuery } from "@/redux/features/profileViews/profileViewsApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

function ProfileViewsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching } = useGetMyProfileViewsQuery({
    page,
    limit,
  });

  const views = data?.data?.views || [];
  const stats = data?.data?.stats;
  const meta = data?.meta;

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (meta && page < meta.totalPage) {
      setPage(page + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Profile Views
        </h1>
        {stats && (
          <p className="text-gray-600 mt-2">
            {stats.totalViews} {stats.totalViews === 1 ? "view" : "views"} from{" "}
            {stats.uniqueViewers}{" "}
            {stats.uniqueViewers === 1 ? "person" : "people"}
          </p>
        )}
      </div>

      {/* Views List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Who viewed your profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : views.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No profile views yet
              </h3>
              <p className="text-gray-600">
                When people view your profile, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {views.map((view) => (
                  <div
                    key={view._id}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      // Navigate to viewer's profile if needed
                      // router.push(`/profile/${view.viewerId._id}`)
                    }}
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      {view.viewerId.profileImage ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}${view.viewerId.profileImage}`}
                            alt={`${view.viewerId.firstName} ${view.viewerId.lastName}`}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-base font-medium">
                            {view.viewerId.firstName?.charAt(0)}
                            {view.viewerId.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {view.viewerId.firstName} {view.viewerId.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{view.viewerRole}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {view.viewerType}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(view.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPage > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={page === 1 || isFetching}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {meta.totalPage}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={page === meta.totalPage || isFetching}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileViewsPage;
