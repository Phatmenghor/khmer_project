


export type UpdateFieldType = 'PRICE' | 'QUANTITY' | 'PROMOTION' | 'ITEM_REMOVED' | 'ITEM_ADDED';

export interface OrderItemUpdateChange {
  field: UpdateFieldType;
  beforeValue: unknown;
  afterValue: unknown;
  description: string;
}

export interface OrderItemUpdateHistoryResponse {
  id: string;
  orderId: string;
  itemId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  sizeName: string | null;
  changes: OrderItemUpdateChange[];
  updatedBy: {
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    businessId?: string;
  };
  updatedAt: string;
  reason?: string;
}

export interface OrderUpdateHistoryResponse {
  id: string;
  orderId: string;
  source: 'POS' | 'PUBLIC';
  totalItemsModified: number;
  itemUpdates: OrderItemUpdateHistoryResponse[];
  createdAt: string;
  requiresConfirmation: boolean;
  confirmedAt?: string;
  confirmedBy?: {
    userId: string;
    firstName: string;
    lastName: string;
  };
}
