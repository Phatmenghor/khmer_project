import { BasePagination } from "@/utils/common/pagination";

export interface AllBrandResponseModel extends BasePagination {
  content: BrandResponseModel[];
}

export interface BrandResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  name: string;
  imageUrl: string;
  description: string;
  status: string;
  totalProducts: number;
  activeProducts: number;
}
