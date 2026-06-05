


export interface POSCheckoutItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;


  productName?: string;
  productImageUrl?: string;
  sizeName?: string | null;
  status?: string;


  customizations?: Array<{
    productCustomizationId: string;
    name: string;
    priceAdjustment: number;
  }>;


  finalPrice?: number;
  totalPrice?: number;


  sku?: string;
  barcode?: string;

  // Promotion fields
  hasPromotion?: boolean | null;
  promotionType?: string | null;
  promotionValue?: number | null;
  promotionFromDate?: string | null;
  promotionToDate?: string | null;
}

export interface DeliveryOptionRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}


export interface CartSummary {
  businessId: string;
  businessName?: string;
  items: POSCheckoutItemRequest[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  customizationTotal: number;
  finalTotal: number;
}


export interface PricingInfo {

  subtotal: number;
  customizationTotal: number;
  deliveryFee: number;

  taxPercentage: number;
  taxAmount: number;

  discountAmount: number;
  discountType?: "FIXED_AMOUNT" | "PERCENTAGE" | null;
  discountReason?: string | null;

  finalTotal: number;
}

export interface PaymentInfo {
  paymentMethod: string;
  paymentStatus?: string;
}


export interface POSCheckoutRequest {
  businessId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  deliveryOption: DeliveryOptionRequest;
  cart: CartSummary;


  pricing: PricingInfo;

  payment: PaymentInfo;

  orderStatus?: string;
  customerNote?: string;
  businessNote?: string;
}
