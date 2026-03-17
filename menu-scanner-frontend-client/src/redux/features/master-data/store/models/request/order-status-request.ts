import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateOrderStatusData } from "../schema/order-status-schema";

export interface AllOrderStatusRequest extends BaseGetAllRequest {
  businessId?: string;
  statuses?: string[];
}

export interface UpdateOrderStatusParams {
  id: string;
  payload: UpdateOrderStatusData;
}
