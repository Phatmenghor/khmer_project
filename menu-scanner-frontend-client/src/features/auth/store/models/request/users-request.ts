


import { BaseGetAllRequest } from "@/utils/common/get-all-request";


export interface CreateUserRequest {
  userIdentifier: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  userType: string;
  businessId?: string;
  roles: string[];
  position?: string;
  address?: string;
  notes?: string;
  accountStatus?: string;
}


export interface UpdateUserRequest {
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  accountStatus?: string;
  businessId?: string;
  roles?: string[];
  position?: string;
  address?: string;
  notes?: string;
}


export interface AllUserRequest extends BaseGetAllRequest {
  accountStatuses?: string[];
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
