import { UserInfoModel } from "@/redux/features/auth/store/models/response/users-response";
import { BasePagination } from "@/utils/common/pagination";

export interface AllLeaveResponseModel extends BasePagination {
  content: LeaveResponseModel[];
}

export interface LeaveResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userInfo: UserInfoModel;
  businessId: string;
  leaveTypeEnum: any;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  actionBy: string;
  actionUserInfo: UserInfoModel;
  actionAt: string;
  actionNote: string;
}
