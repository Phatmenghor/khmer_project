import { UserInfoModel } from "@/redux/features/auth/store/models/response/users-response";
import { BasePagination } from "@/utils/common/pagination";

export interface AllWorkScheduleResponseModel extends BasePagination {
  content: WorkScheduleResponseModel[];
}

export interface WorkScheduleResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userInfo: UserInfoModel;
  businessId: string;
  name: string;
  scheduleTypeEnum: string;
  workDays: string[];
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
}
