// Agent Hiring Types

export interface AgentHiring {
  _id: string;
  agentUserId: string | AgentUser;
  hiredByUserId: string | HiredByUser;
  hiredByUserType: "candidate" | "employer";
  hiredByUserRole: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  hiredAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string | null;
  role: string;
  phone?: string;
}

export interface HiredByUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string | null;
  userType: string;
}

export interface CreateAgentHiringRequest {
  agentUserId: string;
}

export interface UpdateHiringStatusRequest {
  status: "accepted" | "rejected" | "completed";
}

export interface AgentHiringResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: AgentHiring;
}

export interface AgentHiringsListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: AgentHiring[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface CheckActiveHiringResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    hasActiveHiring: boolean;
    hiring: AgentHiring | null;
  };
}

export interface GetHiringsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "accepted" | "rejected" | "completed" | "all";
}
