import { BasePagination } from "@/utils/common/pagination";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";

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
  businessName: string;
  image: ImageUrls;
  description: string;
  status: string;
}
