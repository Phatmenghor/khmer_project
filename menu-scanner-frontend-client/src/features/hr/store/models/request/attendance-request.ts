import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface CreateAttendanceRequest {
  remarks: string;
}

export interface UpdateAttendanceRequest {
  remarks: string;
}

export interface UpdateAttendanceParams {
  id: string;
  param: UpdateAttendanceRequest;
}

export interface AllAttendanceRequest extends BaseGetAllRequest {
  businessId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  statusEnum?: string;
}
