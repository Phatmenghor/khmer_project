import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateBannerData } from "../schema/banner-schema";
import { UpdateCategoriesData } from "../schema/categories-schema";

export interface AllCategoriesRequest extends BaseGetAllRequest {
  status?: string;
}

export interface UpdateCategoriesParams {
  categoriesId: string;
  categoriesData: UpdateCategoriesData;
}
