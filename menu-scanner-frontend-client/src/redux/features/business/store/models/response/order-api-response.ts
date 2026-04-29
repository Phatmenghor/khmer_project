/**
 * Order API Response Models - Simplified without audit trail snapshots
 */

export interface OrderItemApiResponse {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    sizeId: string | null;
    sizeName: string | null;
    status: string;
  };

  quantity: number;
  finalPrice: number;
  totalPrice: number;
}

// Pricing summary
export interface OrderPricingApiResponse {
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}

export interface OrderApiResponse {
  id: string;
  orderNumber: string;
  orderStatus: string;

  // Customer info
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;

  // Business info
  businessId: string;
  businessName: string;

  // Delivery info
  deliveryAddress: {
    village: string;
    commune: string;
    district: string;
    province: string;
    streetNumber?: string;
    houseNumber?: string;
    note?: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryOption: {
    name: string;
    description?: string;
    imageUrl?: string;
    price?: number;
  };

  // Notes
  customerNote: string;
  businessNote: string;

  pricing: OrderPricingApiResponse;
  items: OrderItemApiResponse[];

  payment: {
    paymentMethod: string;
    paymentStatus: string;
  };

  statusHistory: {
    id: string;
    statusName: string;
    statusDescription: string | null;
    note: string | null;
    changedBy: {
      userId: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      businessId?: string;
      fullName?: string;
    } | null;
    changedAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}
