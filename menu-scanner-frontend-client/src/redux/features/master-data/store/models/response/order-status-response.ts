import { BasePagination } from "@/utils/common/pagination";

export interface AllOrderStatusResponseModel extends BasePagination {
  content: OrderStatusResponseModel[];
}

export interface OrderStatusResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string;
  status: string;
  order: number; // Sort order for displaying status sequence
  isInitial?: boolean; // Mark as initial status for new orders
}
