/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useGetAgentRequestsQuery,
  useUpdateHiringStatusMutation,
} from "@/redux/features/agentHiring/agentHiringApi";
import { AgentHiring, HiredByUser } from "@/types/agentHiring";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useFormats } from "@/i18n/format";
import { useOptionLabel } from "@/i18n/options";

export default function AgentHiringPage() {
  const t = useTranslations("employers.hiring");
  const f = useFormats();
  const label = useOptionLabel();
  const [activeTab, setActiveTab] = useState<"requests" | "approved">(
    "requests"
  );

  // Only agents use this page; other employers are sent back to their profile (no failing requests).
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const isAgent = user?.role === "Agent";
  useEffect(() => {
    if (user && !isAgent) router.replace("/profile/employer");
  }, [user, isAgent, router]);

  // Fetch hiring requests (pending)
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useGetAgentRequestsQuery(
    {
      status: "pending",
      page: 1,
      limit: 50,
    },
    { skip: !isAgent }
  );

  // Fetch approved hirings
  const {
    data: approvedData,
    isLoading: approvedLoading,
    refetch: refetchApproved,
  } = useGetAgentRequestsQuery(
    {
      status: "accepted",
      page: 1,
      limit: 50,
    },
    { skip: !isAgent }
  );

  const [updateHiringStatus] = useUpdateHiringStatusMutation();

  const handleAccept = async (hiringId: string) => {
    try {
      await updateHiringStatus({
        hiringId,
        data: { status: "accepted" },
      }).unwrap();
      toast.success(t("acceptedToast"));
      refetchRequests();
      refetchApproved();
    } catch (error) {
      console.error("Failed to accept hiring:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as any).data?.message
          : t("unknownError");
      toast.error(errorMessage || t("acceptFailed"));
    }
  };

  const handleReject = async (hiringId: string) => {
    if (!confirm(t("rejectConfirm"))) {
      return;
    }

    try {
      await updateHiringStatus({
        hiringId,
        data: { status: "rejected" },
      }).unwrap();
      toast.success(t("rejectedToast"));
      refetchRequests();
    } catch (error) {
      console.error("Failed to reject hiring:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as any).data?.message
          : t("unknownError");
      toast.error(errorMessage || t("rejectFailed"));
    }
  };

  const handleComplete = async (hiringId: string) => {
    if (!confirm(t("completeConfirm"))) {
      return;
    }

    try {
      await updateHiringStatus({
        hiringId,
        data: { status: "completed" },
      }).unwrap();
      toast.success(t("completedToast"));
      refetchApproved();
    } catch (error) {
      console.error("Failed to complete hiring:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as any).data?.message
          : t("unknownError");
      toast.error(errorMessage || t("completeFailed"));
    }
  };

  const renderHiringCard = (
    hiring: AgentHiring,
    type: "request" | "approved"
  ) => {
    const hiredByUser =
      typeof hiring.hiredByUserId === "string"
        ? null
        : (hiring.hiredByUserId as HiredByUser);

    if (!hiredByUser) return null;

    const userName = `${hiredByUser.firstName} ${hiredByUser.lastName}`;
    const userAvatar = hiredByUser.profilePicture
      ? `${process.env.NEXT_PUBLIC_BASE_URL}${hiredByUser.profilePicture}`
      : "/placeholder.svg?height=40&width=40";

    return (
      <Card key={hiring._id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{userName}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {label("userType", hiredByUser.userType)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {type === "request"
                    ? t("requestedAgo", { time: f.ago(hiring.hiredAt) })
                    : t("hiredAgo", { time: f.ago(hiring.hiredAt) })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              {type === "request" ? (
                <>
                  <Badge variant="outline" className="text-yellow-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {t("pending")}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAccept(hiring._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t("accept")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(hiring._id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {t("reject")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t("acceptedBadge")}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleComplete(hiring._id)}
                  >
                    {t("markCompleted")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "requests" | "approved")
        }
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="requests">
            {t("tabRequests")}
            {requestsData?.data && requestsData.data.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {requestsData.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            {t("tabApproved")}
            {approvedData?.data && approvedData.data.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {approvedData.data.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>{t("pendingTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : requestsData?.data && requestsData.data.length > 0 ? (
                <div>
                  {requestsData.data.map((hiring) =>
                    renderHiringCard(hiring, "request")
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>{t("noPending")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>{t("approvedTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : approvedData?.data && approvedData.data.length > 0 ? (
                <div>
                  {approvedData.data.map((hiring) =>
                    renderHiringCard(hiring, "approved")
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>{t("noApproved")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
