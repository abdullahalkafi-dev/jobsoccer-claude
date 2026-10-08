export interface Video {
  url: string;
  duration: number;
  title: string;
  uploadedAt: string;
  _id: string;
}

export interface Height {
  size: number;
  unit: string;
}

export interface Weight {
  size: number;
  unit: string;
}

export interface Profile {
  _id: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  phoneNumber: string;
  gender: string;
  height: Height;
  currentClub: string;
  category: string;
  position: string;
  agent: string;
  socialMedia?: string;
  satOrAct: string;
  availability: string;
  weight: Weight;
  collegeOrUniversity: string;
  foot: string;
  league: string;
  schoolName: string;
  diploma: string;
  gpa: string;
  country: string;
  videos: Video[];
  createdAt: string;
  updatedAt: string;
}

export interface ICandidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage: string | null;
  userType: string;
  profile: Profile;
  isShortlisted?: boolean;
  friendRequestStatus?: {
    status: "pending" | "accepted" | "rejected";
    type: "sent" | "received";
  } | null;
  followerCount?: number;
  isFollowing?: boolean;
}

export interface IEmployer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage: string | null;
  userType: "employer";
  profile: {
    _id: string;
    highSchoolName: string;
    country: string;
    address: string;
    founded: string;
    clubName: string;
    phoneNumber: string;
    location: string;
    level: string;
    website: string;
    clubContact: string;
    clubDescription: string;
    __v: number;
  };
  activeJobCount: number;
  followerCount: number;
  isFollowing?: boolean;
}

// Friend can be either a Candidate or Employer with their status indicators
export type IFriend = (ICandidate | IEmployer) & {
  friendshipDate?: string;
};

export interface IFriendsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data: IFriend[];
  requestId: string;
}
