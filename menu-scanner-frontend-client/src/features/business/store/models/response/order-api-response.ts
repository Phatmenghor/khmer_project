


export interface OrderItemApiResponse {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    sku: string;
    barcode: string;
    sizeId: string | null;
    sizeName: string;
    status: string;
  };

  quantity: number;
  currentPrice: number;
  finalPrice: number;
  totalPrice: number;


  hasPromotion: boolean;
  promotionType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;


  customizations: CustomizationDetail[];
  customizationTotal: number;
}

export interface CustomizationDetail {
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}


export interface OrderPricingApiResponse {
  totalItems: number;
  subtotal: number;
  customizationTotal: number;
  deliveryFee: number;
  discountAmount: number;
  discountType?: string;
  discountReason?: string;
  taxPercentage: number;
  taxAmount: number;
  finalTotal: number;
}

export interface OrderApiResponse {
  id: string;
  orderNumber: string;
  orderStatus: string;
  orderFrom: 'CUSTOMER' | 'BUSINESS';


  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;


  businessId: string;
  businessName: string;


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
    price: number;
  };


  customerNote: string;
  businessNote: string;

  pricing: OrderPricingApiResponse;
  items: OrderItemApiResponse[];

  payment: {
    paymentMethod: string;
    paymentStatus: string;
  };

  statusHistory: OrderStatusHistoryItem[];

  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderStatus: string;
  note: string;
  changedByName: string;
  createdAt: string;
}
