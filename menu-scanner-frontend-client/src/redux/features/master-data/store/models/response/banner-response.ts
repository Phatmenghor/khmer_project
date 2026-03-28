import { BasePagination } from "@/utils/common/pagination";

export interface AllBannerResponseModel extends BasePagination {
  content: BannerResponseModel[];
}

export interface BannerResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  imageUrl: string;
  description: string;
  linkUrl: string;
  status: string;
}
