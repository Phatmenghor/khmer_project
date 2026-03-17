export interface CartResponseModel {
  items: CartItemModel[];
  totalItems: number;
  subtotalBeforeDiscount?: number;  // Original price total (currentPrice * qty)
  subtotal: number;                  // Final price total before shipping/fees
  totalDiscount: number;              // Total discount applied
  finalTotal: number;                 // Final total (subtotal + shipping/fees)
}

export interface CartItemModel {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  currentPrice: number;
  finalPrice: number;
  hasPromotion: boolean;
  quantity: number;
  totalPrice: number;
  isAvailable: boolean;
  promotionType: string | null;
  promotionValue: number | null;
  promotionEndDate: string | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
  totalBeforeDiscount?: number;
  discountAmount?: number;
  lastOptimisticTimestamp?: number;
}

// Backward compatible alias
export type CartItemResponseModel = CartItemModel;
