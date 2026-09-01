import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdatePaymentOptionData } from "../schema/payment-options-schema";

export interface AllPaymentOptionsRequest extends BaseGetAllRequest {
  search?: string;
  statuses?: string[];
  businessId?: string;
}

export interface UpdatePaymentOptionParams {
  id: string;
  payload: UpdatePaymentOptionData;
}
