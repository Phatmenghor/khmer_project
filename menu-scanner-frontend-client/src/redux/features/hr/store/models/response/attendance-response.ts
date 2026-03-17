import { UserInfoModel } from "@/redux/features/auth/store/models/response/users-response";
import { BasePagination } from "@/utils/common/pagination";

export interface AllAttendanceResponseModel extends BasePagination {
  content: AttendanceResponseModel[];
}

export interface AttendanceResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userInfo: UserInfoModel;
  businessId: string;
  workScheduleId: string;
  attendanceDate: string;
  checkIns: CheckInModel[];
  status: string;
  remarks: string;
}

interface CheckInModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  checkInType: string;
  checkInTime: string;
  latitude: number;
  longitude: number;
  remarks: string;
}
