


import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { PaymentOptionType } from "@/features/master-data/store/models/response/payment-option-response";
import { OrderResponse } from "../models/response/order-response";
import { OrderStatus } from "@/enums/order-status.enum";
import { OrderFromEnum } from "@/enums/order.enum";

export interface CheckoutPayload {
  businessId: string;
  addressId: string;
  deliveryOption: {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
  };

  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
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
      sku?: string;
      barcode?: string;

      currentPrice: number;
      finalPrice: number;
      hasPromotion: boolean;
      quantity: number;

      totalBeforeDiscount: number;
      discountAmount: number;
      totalPrice: number;

      promotionType: string;
      promotionValue: number;
      promotionFromDate: string;
      promotionToDate: string;

      customizations?: Array<{
        productCustomizationId: string;
        name: string;
        priceAdjustment: number;
      }>;
    }>;
    totalItems: number;
    totalQuantity: number;
    subtotalBeforeDiscount: number;
    subtotal: number;
    customizationTotal: number;
    totalDiscount: number;
    finalTotal: number;
  };

  pricing?: {
    subtotal: number;
    deliveryFee: number;
    taxPercentage?: number;
    taxAmount?: number;
    discountAmount?: number;
    discountType?: string;
    discountReason?: string;
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


export const fetchOrderByIdService = createApiThunk<OrderResponse, string>(
  "order/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/orders/${id}`
    );
    return response.data.data;
  }
);
