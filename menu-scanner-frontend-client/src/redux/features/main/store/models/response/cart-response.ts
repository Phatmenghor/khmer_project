export interface CartResponseModel {
  items: CartItemModel[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
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
  lastOptimisticTimestamp?: number;
}

// Backward compatible alias
export type CartItemResponseModel = CartItemModel;
