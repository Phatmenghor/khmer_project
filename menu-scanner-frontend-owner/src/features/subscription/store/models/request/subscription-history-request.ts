import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllSubscriptionHistoryRequest extends BaseGetAllRequest {
  businessId?: string;
  planId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}
