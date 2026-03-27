import { BasePagination } from "@/utils/common/pagination";

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
  accountStatus: string;          // Business user status (ACTIVE, END_WORK, LOCKED)
  status: string;                 // System status
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
  addresses?: Array<any>;
  emergencyContacts?: Array<any>;
  documents?: Array<any>;
  educations?: Array<any>;
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
