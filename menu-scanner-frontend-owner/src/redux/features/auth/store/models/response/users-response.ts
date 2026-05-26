import { Pagination } from "@/utils/common/pagination";

export interface AllUserResponseModel extends Pagination {
  content: UserResponseModel[];
}

export interface UserResponseModel {
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
  telegramId?: number;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramPhotoUrl?: string;
  telegramSyncedAt?: string;
  telegramSynced?: boolean;
  lastLoginAt?: string;
}
