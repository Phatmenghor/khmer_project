import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllSessionRequest extends BaseGetAllRequest {
  userId?: string;
  statuses?: string[];
  deviceTypes?: string[];
}
