import React from "react";
import { User } from "lucide-react";
import { RequestCardProps } from "@/types/cards";
import Image from "next/image";

// Request Card Component
const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onAccept,
  onCancel,
  isLoading = false,
}) => {
  const senderName = `${request.senderId.firstName} ${request.senderId.lastName}`;
  const senderRole = request.senderRole;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            {request.senderId.profileImage ? (
              <Image
                src={request.senderId.profileImage}
                alt={senderName}
                className="rounded-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <User size={20} className="text-gray-600" />
            )}
          </div>
        </div>
        <div>
          <h3 className="md:font-medium text-gray-900">{senderName}</h3>
          <p className="text-xs md:text-sm text-gray-500">{senderRole}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onCancel(request._id)}
          disabled={isLoading}
          className="px-2 sm:px-4 py-1 sm:py-2 text-xs md:text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel Request
        </button>
        <button
          onClick={() => onAccept(request._id)}
          disabled={isLoading}
          className="px-2 sm:px-4 py-1 sm:py-2 text-xs md:text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Accept Request
        </button>
      </div>
    </div>
  );
};

export default RequestCard;
