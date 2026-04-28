import { BasePagination } from "@/utils/common/pagination";

export interface AllSubcategoriesResponseModel extends BasePagination {
  content: SubcategoriesResponseModel[];
}

export interface SubcategoriesResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  categoryId: string;
  categoryName: string;
  businessId: string;
  businessName: string;
  name: string;
  imageUrl: string;
  status: string;
}
