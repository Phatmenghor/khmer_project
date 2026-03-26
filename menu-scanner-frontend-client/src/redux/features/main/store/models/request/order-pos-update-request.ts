/**
 * POS Order Update Request Models
 * Simplified: Used only for updating EXISTING orders
 * For creating NEW orders from POS, use POSCheckoutRequest instead
 */

export interface POSOrderItemUpdate {
  itemId: string;
  newPrice?: number;
  newQuantity?: number;
  newPromotionType?: string | null;
  newPromotionValue?: number | null;
  reason?: string;
}

/**
 * Update existing order (only items, not creation)
 * Use for: Changing prices, quantities, or promotions AFTER order is created
 */
export interface UpdateOrderItemsFromPOSRequest {
  orderId: string;
  itemUpdates: POSOrderItemUpdate[];
  reason?: string;
  shouldAutoConfirm?: boolean;
}

/**
 * Confirm POS changes to an existing order
 * Moves order from PENDING_POS_CONFIRMATION to CONFIRMED
 */
export interface ConfirmPOSOrderChangesRequest {
  orderId: string;
  confirmed: boolean;
  adminNote?: string;
}

/**
 * Customer can only update notes on their order
 */
export interface UpdateOrderFromPublicRequest {
  orderId: string;
  customerNote?: string;
}
