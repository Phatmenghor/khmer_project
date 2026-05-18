import { DayOfWeek } from "@/constants/status/type";
import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface CreateWorkScheduleRequest {
  userId: string;
  businessId?: string;
  name: string;
  scheduleTypeEnum: string;
  workDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface UpdateWorkScheduleRequest {
  name: string;
  scheduleTypeEnum: string;
  workDays: DayOfWeek[];

  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface AllWorkScheduleRequest extends BaseGetAllRequest {
  businessId?: string;
  userId?: string;
}

export interface UpdateWorkScheduleParams {
  id: string;
  param: UpdateWorkScheduleRequest;
}
