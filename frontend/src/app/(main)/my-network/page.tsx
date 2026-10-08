"use client";

import React, { useState, useMemo } from "react";
import CandidateCard from "@/components/cards/CandidateCard";
import { EmployerCard } from "@/components/cards/EmployerCard";
import { Search, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetFriendsQuery } from "@/redux/features/friend/friendApi";
import { IFriend, ICandidate, IEmployer } from "@/types/user";
import {
  CandidateCardSkeletonGrid,
  EmployerCardSkeletonGrid,
} from "@/components/skeleton";

function MyNetworkPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const page = 1;
  const limit = 20;

  // Fetch friends with dynamic filters
  const {
    data: friendsData,
    isLoading,
    error,
  } = useGetFriendsQuery({
    search: searchTerm,
    page,
    limit,
  });

  // Separate friends by userType
  const { candidates, employers } = useMemo(() => {
    if (!friendsData?.data) return { candidates: [], employers: [] };

    const filteredFriends = friendsData.data.filter((friend: IFriend) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "player") return friend.userType === "candidate";
      if (selectedFilter === "club") return friend.userType === "employer";
      return true;
    });

    const candidatesList: ICandidate[] = [];
    const employersList: IEmployer[] = [];

    filteredFriends.forEach((friend: IFriend) => {
      if (friend.userType === "candidate") {
        candidatesList.push(friend as ICandidate);
      } else if (friend.userType === "employer") {
        employersList.push(friend as IEmployer);
      }
    });

    return { candidates: candidatesList, employers: employersList };
  }, [friendsData, selectedFilter]);

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">
            Failed to load friends. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header with Search and Filter */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          My Network
          {friendsData?.meta && (
            <span className="text-lg text-gray-500 ml-2">
              ({friendsData.meta.total})
            </span>
          )}
        </h2>
        <div className="flex gap-4 items-center">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          {/* Filter Select */}
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-32 h-12 rounded-xl border-gray-300">
              <Settings2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="player">Players</SelectItem>
              <SelectItem value="club">Clubs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employers Section */}
      {(isLoading || employers.length > 0) && (
        <section className="mb-8">
          {employers.length > 0 && !isLoading && (
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Clubs & Organizations ({employers.length})
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {isLoading ? (
              <EmployerCardSkeletonGrid count={4} className="contents" />
            ) : (
              employers.map((employer) => (
                <EmployerCard key={employer._id} employer={employer} />
              ))
            )}
          </div>
        </section>
      )}

      {/* Candidates Section */}
      {(isLoading || candidates.length > 0) && (
        <section className="mb-8">
          {candidates.length > 0 && !isLoading && (
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Players & Staff ({candidates.length})
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {isLoading ? (
              <CandidateCardSkeletonGrid count={4} className="contents" />
            ) : (
              candidates.map((candidate) => (
                <CandidateCard key={candidate._id} candidate={candidate} />
              ))
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && candidates.length === 0 && employers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || selectedFilter !== "all"
              ? "No friends found matching your criteria."
              : "You haven't added any friends yet."}
          </p>
        </div>
      )}
    </div>
  );
}

export default MyNetworkPage;
