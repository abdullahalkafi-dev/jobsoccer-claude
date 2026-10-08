"use client";

import type React from "react";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetPopularSearchQuery } from "@/redux/features/job/jobApi";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { employerRoles } from "@/shchemas/signupValidation";

export function EmployerSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPopular, setSelectedPopular] = useState<string>("");
  const router = useRouter();

  const { data: popularSearchData } = useGetPopularSearchQuery(undefined);
  const popularSearches: string[] = popularSearchData?.data?.employers || [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("searchTerm", searchTerm);
    if (selectedCategory) params.set("role", selectedCategory);
    if (selectedLocation) params.set("country", selectedLocation);

    router.push(`/employers/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePopularSearch = (search: string) => {
    setSelectedPopular(search);
    setSearchTerm(search);
    const params = new URLSearchParams();
    params.set("searchTerm", search);
    router.push(`/employers/search?${params.toString()}`);
  };

  return (
    <div className="bg-[#F7F6F2] px-4 py-8">
      {/* Main Search Container */}
      <div className="container mx-auto pb-4 flex items-center justify-center">
        <div className="w-full md:w-auto flex flex-col p-2 md:flex-row gap-2 items-center justify-center rounded-2xl border border-gray-100 bg-white">
          {/* Search Input */}
          <div className="relative w-full lg:w-64 border md:border-none rounded-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search Employers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 h-12 border-none shadow-none bg-transparent text-gray-700 placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>

          {/* Category Select */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-64 border py-6 md:py-0  md:border-none shadow-none">
              <SelectValue placeholder="Select employer category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {employerRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Location */}
          <div className="relative w-full lg:w-64 border md:border-0 rounded-lg">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 h-12 border-none shadow-none bg-transparent text-gray-700 placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="h-12 w-full md:w-52 bg-yellow-300 hover:scale-105 transition-transform duration-200 rounded-xl font-medium"
          >
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
        </div>
      </div>

      {/* Popular Searches */}
      {popularSearches.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <span className="text-gray-600 font-medium">Popular Searches:</span>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handlePopularSearch(search)}
                className={`px-4 py-1 border rounded-full text-sm transition-colors capitalize ${
                  selectedPopular === search
                    ? "bg-[#5D4E37] text-white hover:bg-[#6B5B3A]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
