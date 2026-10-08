// Card component types

export interface AcceptedRequestCardProps {
  request: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage: string | null;
    userType: string;
    friend: {
      _id: string;
      email: string;
      role: string;
      userType: string;
      createdAt: string;
    };
    friendshipDate: string;
  };
}

export interface RequestCardProps {
  request: {
    _id: string;
    senderId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage: string | null;
      role: string;
      userType: string;
      createdAt: string;
    };
    senderType: string;
    senderRole: string;
    receiverId: string;
    receiverRole: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
    updatedAt: string;
  };
  onAccept: (id: string) => void;
  onCancel: (id: string) => void;
  isLoading?: boolean;
}
