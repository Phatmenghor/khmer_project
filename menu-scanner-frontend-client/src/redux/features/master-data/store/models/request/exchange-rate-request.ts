import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateBrandData } from "../schema/brand-schema";
import { UpdateExchangeRateData } from "../schema/exchange-rate-schema";

export interface AllExchangeRateRequest extends BaseGetAllRequest {
  isActive?: boolean;
}

export interface UpdateExchangeRateParams {
  id: string;
  payload: UpdateExchangeRateData;
}
