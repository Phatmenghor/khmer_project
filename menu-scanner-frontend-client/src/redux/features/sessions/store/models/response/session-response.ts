import { BasePagination } from "@/utils/common/pagination";

export interface AllSessionsResponseModel extends BasePagination {
  content: SessionResponseModel[];
}

export interface SessionResponseModel {
  id: string;
  userId: string;
  userIdentifier: string;
  userFullName: string;
  userType: string;
  deviceId: string;
  deviceName: any;
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
  loggedOutAt: any;
  logoutReason: any;
  isCurrentSession: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
