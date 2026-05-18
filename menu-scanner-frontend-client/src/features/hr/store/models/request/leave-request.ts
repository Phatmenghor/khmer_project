import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface CreateLeaveRequest {
  leaveTypeEnum: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveLeaveRequest {
  status: string;
  actionNote: string;
}

export interface ApproveLeaveParams {
  id: string;
  param: ApproveLeaveRequest;
}

export interface UpdateLeaveRequest {
  leaveTypeEnum: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveParams {
  id: string;
  param: UpdateLeaveRequest;
}

export interface ActionLeaveRequest {
  status: string;
  actionNote: string;
}

export interface AllLeaveRequest extends BaseGetAllRequest {
  businessId?: string;
  userId?: string;
  leaveTypeEnum?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
