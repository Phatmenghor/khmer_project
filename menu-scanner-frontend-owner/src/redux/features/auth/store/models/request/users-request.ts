import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface ImageUrls {
  sm?: string;
  md?: string;
  o?: string;
}

export interface CreateUserRequest {
  userIdentifier: string;
  password: string;
  userType: string;
  accountStatus?: string;
  roles: string[];
  email?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  profileImage?: ImageUrls;
  remark?: string;
}

export interface UpdateUserRequest {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  profileImage?: ImageUrls;
  accountStatus?: string;
  roles?: string[];
  remark?: string;
}

export interface AllUserRequest extends BaseGetAllRequest {
  accountStatus?: string[];
  roles?: string[];
  userTypes?: string[];
}

export interface UpdateUserParams {
  userId: string;
  userData: UpdateUserRequest;
}

export interface ToggleUserStatusRequest {
  id: string;
  accountStatus: string;
}

export interface AdminChangePasswordRequest {
  userId: string;
  newPassword: string;
  confirmPassword: string;
}
