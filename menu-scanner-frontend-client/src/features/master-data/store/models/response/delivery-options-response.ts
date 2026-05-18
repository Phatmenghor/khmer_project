import { BasePagination } from "@/utils/common/pagination";

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
  imageUrl: string;
  price: number;
  status: string;
}
