import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateBrandData } from "../schema/brand-schema";

export interface AllBrandRequest extends BaseGetAllRequest {
  status?: string;
}

export interface UpdateBrandParams {
  brandId: string;
  brandData: UpdateBrandData;
}
