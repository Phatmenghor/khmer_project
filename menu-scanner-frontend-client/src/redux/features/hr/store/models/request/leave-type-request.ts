import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface CreateLeaveTypeRequest {
  enumName: string;
  description: string;
}

export interface UpdateLeaveTypeRequest {
  enumName: string;
  description: string;
}

export interface AllLeaveTypeRequest extends BaseGetAllRequest {
  businessId?: string;
}

export interface UpdateLeaveTypeParams {
  id: string;
  param: UpdateLeaveTypeRequest;
}
