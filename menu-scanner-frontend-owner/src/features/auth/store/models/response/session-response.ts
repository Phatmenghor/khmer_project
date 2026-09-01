import { BasePagination } from "@/utils/common/pagination";

export interface AllSessionResponseModel extends BasePagination {
  content: SessionResponse[];
}

export interface SessionResponse {
  id: string;
  userId: string;
  userIdentifier: string;
  userFullName: string;
  userType: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  deviceDisplayName: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  status: string;
  loginAt: string;
  lastActiveAt: string;
  expiresAt: string;
  loggedOutAt: string;
  logoutReason: string;
  isCurrentSession: boolean;
}
