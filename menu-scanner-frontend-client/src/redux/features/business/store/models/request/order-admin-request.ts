import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllOrderAdminRequest extends BaseGetAllRequest {
  businessId?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  startDate?: string; // ISO 8601 format
  endDate?: string;   // ISO 8601 format
}

export interface UpdateOrderRequest {
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  customerNote?: string;
  businessNote?: string;
  discountAmount?: number;
  taxAmount?: number;
  deliveryFee?: number;
}

export interface UpdateOrderParams {
  orderId: string;
  orderData: UpdateOrderRequest;
}
