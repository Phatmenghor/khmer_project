import { BasePagination } from "@/utils/common/pagination";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export interface AllDeliveryOptionsResponseModel extends BasePagination {
  content: DeliveryOptionsResponseModel[];
}

export interface DeliveryOptionsResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string;
  image: ImageUrls;
  price: number;
  status: string;
}
