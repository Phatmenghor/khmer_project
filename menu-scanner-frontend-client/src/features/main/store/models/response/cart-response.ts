export interface CartResponseModel {
  items: CartItemModel[];
  totalItems: number;
  totalQuantity?: number;
  subtotalBeforeDiscount?: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
}

export interface CartItemCustomization {
  id: string;
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}

export interface CartItemModel {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  status?: string;
  currentPrice: number;
  finalPrice: number;
  hasPromotion?: boolean;
  quantity: number;
  totalPrice: number;
  isAvailable?: boolean;
  promotionType: string | null;
  promotionValue: number | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
  totalBeforeDiscount?: number;
  discountAmount?: number;
  lastOptimisticTimestamp?: number;
  sku?: string;
  barcode?: string;
  customizations?: CartItemCustomization[];
}


export type CartItemResponseModel = CartItemModel;
