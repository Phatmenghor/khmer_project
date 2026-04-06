/**
 * Order Management - Async Thunks
 * Redux thunks for Order CRUD operations
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { PaymentOptionType } from "@/redux/features/master-data/store/models/response/payment-option-response";
import { OrderResponse } from "../models/response/order-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { OrderFromEnum } from "@/enums/order.enum";

export interface CheckoutPayload {
  businessId: string;
  deliveryAddress: {
    village: string;
    commune: string;
    district: string;
    province: string;
    streetNumber: string;
    houseNumber: string;
    note: string;
    latitude: number;
    longitude: number;
  };
  deliveryOption: {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
  };
  cart: {
    businessId: string;
    businessName: string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      productImageUrl: string;
      productSizeId: string | null;
      sizeName: string;
      status: string;
      currentPrice: number;
      finalPrice: number;
      hasActivePromotion: boolean;
      quantity: number;
      totalBeforeDiscount: number;
      discountAmount: number;
      totalPrice: number;
      promotionType: string;
      promotionValue: number;
      promotionFromDate: string;
      promotionToDate: string;
    }>;
    totalItems: number;
    totalQuantity: number;
    subtotalBeforeDiscount: number;
    subtotal: number;
    totalDiscount: number;
    finalTotal: number;
  };
  payment: {
    paymentMethod: PaymentOptionType;
    paymentStatus: "PENDING";
  };
  customerNote: string;
  orderFrom: OrderFromEnum;
  orderStatus?: OrderStatus;
}

/**
 * Create a new order from checkout
 */
export const createOrderService = createApiThunk<OrderResponse, CheckoutPayload>(
  "order/create",
  async (payload) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/orders/checkout",
      payload
    );
    return response.data.data;
  }
);

/**
 * Fetch order by ID
 */
export const fetchOrderByIdService = createApiThunk<OrderResponse, string>(
  "order/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/orders/${id}`
    );
    return response.data.data;
  }
);
