import { BasePagination } from "@/utils/common/pagination";

export interface AllCategoriesResponseModel extends BasePagination {
  content: CategoriesResponseModel[];
}

export interface CategoriesResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  name: string;
  imageUrl: string;
  status: string;
  totalProducts?: number;
  activeProducts?: number;
  productCount?: number; // From /my-business/product/all endpoint
}
