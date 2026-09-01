import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateBannerData } from "../schema/banner-schema";
import { UpdateDeliveryOptionsData } from "../schema/delivery-options-schema";

export interface AllDeliveryOptionsRequest extends BaseGetAllRequest {
  businessId?: string;
  statuses?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface UpdateDeliveryOptionsParams {
  id: string;
  payload: UpdateDeliveryOptionsData;
}
