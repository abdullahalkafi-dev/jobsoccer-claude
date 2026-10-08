import React from "react";
import { User } from "lucide-react";
import Image from "next/image";
import { AcceptedRequestCardProps } from "@/types/cards";
import Link from "next/link";

// Accepted Request Card Component
const AcceptedRequestCard: React.FC<AcceptedRequestCardProps> = ({
  request,
}) => {
  const friendName = request.firstName + " " + request.lastName;
  const friendRole = request.role || "User";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            {request.profileImage ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${request.profileImage}`}
                alt={friendName}
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={20} className="text-gray-600" />
            )}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{friendName}</h3>
          <p className="text-sm text-gray-500">{friendRole}</p>
        </div>
      </div>

      <button className="px-2 sm:px-4 py-1 sm:py-2 text-xs md:text-sm max-w-[200px] text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
        <Link href={`/candidates/${request._id}`} className="inline-block mr-2">
          <span>View Profile</span>
        </Link>
      </button>
    </div>
  );
};

export default AcceptedRequestCard;
