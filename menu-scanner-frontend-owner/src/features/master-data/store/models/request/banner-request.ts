import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateBannerData } from "../schema/banner-schema";

export interface AllBannerRequest extends BaseGetAllRequest {
  status?: string;
  businessId?: string;
}

export interface UpdateBannerParams {
  id: string;
  payload: UpdateBannerData;
}
