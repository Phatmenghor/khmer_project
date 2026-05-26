import { BasePagination } from "@/utils/common/pagination";

export interface Address {
  id?: string;
  addressType: string;
  houseNo: string;
  street: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface Document {
  id?: string;
  type: string;
  number: string;
  fileUrl: string;
}

export interface Education {
  id?: string;
  level: string;
  schoolName: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  isGraduated: boolean;
  certificateUrl: string;
}

export interface CustomerUserResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userIdentifier: string;
  userType: string;
  accountStatus: string;
  status: string;
  roles: string[];
  businessId?: string;
  businessName?: string;
  remark?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber: string;
  profileImageUrl?: string;
  employeeId?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  leaveDate?: string;
  shift?: string;
  telegramId?: number;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramPhotoUrl?: string;
  telegramSyncedAt?: string;
  telegramSynced?: boolean;
  lastLoginAt?: string;
  addresses?: Address[];
  emergencyContacts?: EmergencyContact[];
  documents?: Document[];
  educations?: Education[];
}

export interface AllUserResponseModel extends BasePagination {
  content: UserResponseModel[];
}

export interface UserResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userIdentifier: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  profileImageUrl: string;
  userType: string;
  accountStatus: string;
  status: string;
  roles: string[];
  position?: string;
  address?: string;
  notes?: string;
  businessId: string;
  businessName?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  employeeId?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  leaveDate?: string;
  shift?: string;
  remark?: string;
  telegramId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramPhotoUrl?: string;
  telegramSyncedAt?: string;
  telegramSynced?: boolean;
  lastLoginAt?: string;
  addresses?: Address[];
  emergencyContacts?: EmergencyContact[];
  documents?: Document[];
  educations?: Education[];
}

export interface UserInfoModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
  fullName: string;
}
