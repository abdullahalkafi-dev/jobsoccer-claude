"use client";

import React, { useState } from "react";
import { Search, Filter, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillingRecord {
  id: string;
  invoice: string;
  billingDate: string;
  plan: "Monthly" | "Half-yearly";
  downloadUrl: string;
}

const billingData: BillingRecord[] = [
  {
    id: "1",
    invoice: "Invoice_February_2024",
    billingDate: "16/02/2024",
    plan: "Monthly",
    downloadUrl: "#",
  },
  {
    id: "2",
    invoice: "Invoice_August_2024",
    billingDate: "23/08/2024",
    plan: "Half-yearly",
    downloadUrl: "#",
  },
  {
    id: "3",
    invoice: "Invoice_February_2024",
    billingDate: "16/02/2024",
    plan: "Monthly",
    downloadUrl: "#",
  },
  {
    id: "4",
    invoice: "Invoice_March_2025",
    billingDate: "15/03/2025",
    plan: "Half-yearly",
    downloadUrl: "#",
  },
];

const features = [
  "Free e-mail alerts",
  "Automatic job recommendations",
  "Unlimited job applications",
  "Job insights",
  "Top applicant badge",
];

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredBilling = billingData.filter((record) => {
    const matchesSearch =
      record.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.billingDate.includes(searchTerm) ||
      record.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || record.plan.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Monthly Plan Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Plan Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Monthly
                </h2>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                You can use one month
              </p>

              {/* Features List */}
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">$29</div>
            </div>
          </div>
        </div>

        {/* Billing History Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Billing history
            </h3>

            {/* Search and Filter */}
            <div className="flex gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter Select */}
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-24 h-9 text-sm border-gray-300">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="half-yearly">Half-yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filter Display */}
          {selectedFilter !== "all" && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtered by:</span>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-xs rounded-full"
                onClick={() => setSelectedFilter("all")}
              >
                {selectedFilter.charAt(0).toUpperCase() +
                  selectedFilter.slice(1)}
                <button
                  onClick={() => setSelectedFilter("all")}
                  className="ml-1 hover:text-gray-600"
                >
                  ×
                </button>
              </Button>
            </div>
          )}

          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div>Invoice</div>
            <div>Billing date</div>
            <div>Plan</div>
            <div>Download</div>
          </div>

          {/* Billing Records */}
          <div className="space-y-4 mt-4">
            {filteredBilling.length > 0 ? (
              filteredBilling.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-4 border-b border-gray-100 last:border-b-0"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.invoice}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.billingDate}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {record.plan}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:contents">
                    <div className="font-medium text-gray-900">
                      {record.invoice}
                    </div>
                    <div className="text-gray-600">{record.billingDate}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{record.plan}</span>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No billing records found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFilter("all");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredBilling.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredBilling.length} of {billingData.length}{" "}
                  records
                </span>
                <span>Total billing records: {billingData.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
