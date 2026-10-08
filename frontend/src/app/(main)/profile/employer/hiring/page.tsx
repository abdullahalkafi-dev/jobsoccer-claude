/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
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
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function AgentHiringPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "approved">(
    "requests"
  );

  // Fetch hiring requests (pending)
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useGetAgentRequestsQuery({
    status: "pending",
    page: 1,
    limit: 50,
  });

  // Fetch approved hirings
  const {
    data: approvedData,
    isLoading: approvedLoading,
    refetch: refetchApproved,
  } = useGetAgentRequestsQuery({
    status: "accepted",
    page: 1,
    limit: 50,
  });

  const [updateHiringStatus] = useUpdateHiringStatusMutation();

  const handleAccept = async (hiringId: string) => {
    try {
      await updateHiringStatus({
        hiringId,
        data: { status: "accepted" },
      }).unwrap();
      toast.success("Hiring request accepted successfully!");
      refetchRequests();
      refetchApproved();
    } catch (error) {
      console.error("Failed to accept hiring:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as any).data?.message
          : "Unknown error";
      toast.error(errorMessage || "Failed to accept hiring request");
    }
  };

  const handleReject = async (hiringId: string) => {
    if (!confirm("Are you sure you want to reject this hiring request?")) {
      return;
    }

    try {
      await updateHiringStatus({
        hiringId,
        data: { status: "rejected" },
      }).unwrap();
      toast.success("Hiring request rejected");
      refetchRequests();
    } catch (error) {
      console.error("Failed to reject hiring:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as any).data?.message
          : "Unknown error";
      toast.error(errorMessage || "Failed to reject hiring request");
    }
  };

  const handleComplete = async (hiringId: string) => {
    if (!confirm("Mark this hiring as completed?")) {
      return;
    }

    try {
      await updateHiringStatus({
        hiringId,
        data: { status: "completed" },
      }).unwrap();
      toast.success("Hiring marked as completed");
      refetchApproved();
    } catch (error) {
      console.error("Failed to complete hiring:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as any).data?.message
          : "Unknown error";
      toast.error(errorMessage || "Failed to complete hiring");
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
                  {hiredByUser.userType}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {type === "request" ? "Requested" : "Hired"}{" "}
                  {formatDistanceToNow(new Date(hiring.hiredAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              {type === "request" ? (
                <>
                  <Badge variant="outline" className="text-yellow-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAccept(hiring._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(hiring._id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleComplete(hiring._id)}
                  >
                    Mark as Completed
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
      <h1 className="text-3xl font-bold mb-6">Hiring Management</h1>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "requests" | "approved")
        }
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="requests">
            Hiring Requests
            {requestsData?.data && requestsData.data.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {requestsData.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
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
              <CardTitle>Pending Hiring Requests</CardTitle>
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
                  <p>No pending hiring requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Hirings</CardTitle>
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
                  <p>No approved hirings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
