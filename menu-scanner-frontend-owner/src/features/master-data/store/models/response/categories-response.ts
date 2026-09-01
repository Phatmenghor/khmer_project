import { BasePagination } from "@/utils/common/pagination";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";

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
  image: ImageUrls;
  description?: string;
  status: string;
  totalProducts?: number;
  activeProducts?: number;
  productCount?: number;
}
