import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface UserAddressRequest {
  id?: string;
  addressType?: string;
  houseNo?: string;
  street?: string;
  village?: string;
  commune?: string;
  district?: string;
  province?: string;
  country?: string;
}

export interface UserEmergencyContactRequest {
  id?: string;
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface UserDocumentRequest {
  id?: string;
  type?: string;
  number?: string;
  fileUrl?: string;
}

export interface UserEducationRequest {
  id?: string;
  level?: string;
  schoolName?: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  isGraduated?: boolean | string;
  certificateUrl?: string;
}

export interface CreateUserRequest {
  userIdentifier: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  userType: string;
  businessId?: string;
  roles: string[];
  accountStatus?: string;
  gender?: string;
  dateOfBirth?: string;
  employeeId?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  leaveDate?: string;
  shift?: string;
  remark?: string;
  addresses?: UserAddressRequest[];
  emergencyContacts?: UserEmergencyContactRequest[];
  documents?: UserDocumentRequest[];
  educations?: UserEducationRequest[];
}

export interface UpdateUserRequest {
  id?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  accountStatus?: string;
  businessId?: string;
  roles?: string[];
  gender?: string;
  dateOfBirth?: string;
  employeeId?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  leaveDate?: string;
  shift?: string;
  remark?: string;
  addresses?: UserAddressRequest[];
  emergencyContacts?: UserEmergencyContactRequest[];
  documents?: UserDocumentRequest[];
  educations?: UserEducationRequest[];
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
