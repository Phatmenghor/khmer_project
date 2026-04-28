import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateSubcategoriesData } from "../schema/subcategories-schema";

export interface AllSubcategoriesRequest extends BaseGetAllRequest {
  categoryId?: string;
  status?: string;
}

export interface UpdateSubcategoriesParams {
  subcategoriesId: string;
  subcategoriesData: UpdateSubcategoriesData;
}
