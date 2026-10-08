"use client";

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { Pagination } from "../Shared/Pagination";
import { FiEye } from "react-icons/fi";

interface Payment {
  transactionId: string;
  bookingId: string;
  providerName: string;
  amount: number;
  paymentStatus: "Paid" | "Unpaid";
}

// Sample data - replace with actual API data
const payments: Payment[] = [
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Paid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Unpaid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Paid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Unpaid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Paid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Unpaid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Paid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Unpaid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Paid",
  },
  {
    transactionId: "#561002",
    bookingId: "#CN 565",
    providerName: "Rahim Khan",
    amount: 562,
    paymentStatus: "Unpaid",
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700";
    case "Unpaid":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function PaymentsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const handleViewDetails = (transactionId: string) => {
    // Navigate to payment details or trigger modal
    console.log("View payment details:", transactionId);
  };

  // Filter payments based on search
  const filteredPayments = payments.filter(
    (payment) =>
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Payment Management</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Provider Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentPayments.map((payment, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.transactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.bookingId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.providerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${payment.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                      payment.paymentStatus,
                    )}`}
                  >
                    {payment.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleViewDetails(payment.transactionId)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-md"
                    aria-label="View payment details"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {currentPayments.map((payment, index) => (
          <div key={index} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                {payment.transactionId}
              </span>
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                  payment.paymentStatus,
                )}`}
              >
                {payment.paymentStatus}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Booking ID:</span>
                <span className="text-sm text-gray-900">{payment.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Provider:</span>
                <span className="text-sm text-gray-900">{payment.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  ${payment.amount}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleViewDetails(payment.transactionId)}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 p-2 w-full border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="View payment details"
            >
              <FiEye className="w-4 h-4" />
              <span className="text-sm">View Details</span>
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="border-t border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* No Results */}
      {filteredPayments.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No payments found matching your search.
        </div>
      )}
    </div>
  );
}
