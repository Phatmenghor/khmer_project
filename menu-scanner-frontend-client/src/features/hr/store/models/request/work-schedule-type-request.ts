import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface CreateWorkScheduleTypeRequest {
  enumName: string;
  description: string;
}

export interface UpdateWorkScheduleTypeRequest {
  enumName: string;
  description: string;
}

export interface AllWorkScheduleTypeRequest extends BaseGetAllRequest {
  businessId?: string;
}

export interface UpdateWorkScheduleTypeParams {
  id: string;
  param: UpdateWorkScheduleTypeRequest;
}
