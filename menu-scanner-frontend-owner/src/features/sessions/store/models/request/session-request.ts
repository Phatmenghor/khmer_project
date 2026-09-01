import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllSessionsRequest extends BaseGetAllRequest {
  businessId?: string;
}
