


export interface POSOrderItemUpdate {
  itemId: string;
  newPrice?: number;
  newQuantity?: number;
  newPromotionType?: string | null;
  newPromotionValue?: number | null;
  reason?: string;
}


export interface UpdateOrderItemsFromPOSRequest {
  orderId: string;
  itemUpdates: POSOrderItemUpdate[];
  reason?: string;
  shouldAutoConfirm?: boolean;
}


export interface ConfirmPOSOrderChangesRequest {
  orderId: string;
  confirmed: boolean;
  adminNote?: string;
}


export interface UpdateOrderFromPublicRequest {
  orderId: string;
  customerNote?: string;
}
