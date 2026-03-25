/**
 * POS Order Update Request Models
 * Sent when admin updates an order from POS
 */

export interface POSOrderItemUpdate {
  itemId: string;
  newPrice?: number;
  newQuantity?: number;
  newPromotionType?: string | null;
  newPromotionValue?: number | null;
  reason?: string; // Why the change was made
}

export interface UpdateOrderFromPOSRequest {
  orderId: string;
  itemUpdates: POSOrderItemUpdate[];
  reason?: string; // General reason for all changes
  shouldAutoConfirm?: boolean; // If false, order goes to PENDING_POS_CONFIRMATION
}

export interface ConfirmPOSOrderChangesRequest {
  orderId: string;
  confirmed: boolean; // true to confirm, false to reject
  adminNote?: string; // Admin's note for confirmation/rejection
}

export interface UpdateOrderFromPublicRequest {
  orderId: string;
  customerNote?: string;
  // Public customers cannot update items, only notes
}
