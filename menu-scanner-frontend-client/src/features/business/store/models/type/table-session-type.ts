export type TableSessionStatus = "ACTIVE" | "BILL_REQUESTED" | "PAID" | "CANCELLED";
export type TableSessionItemStatus = "PENDING" | "PREPARING" | "SERVED" | "CANCELLED";

export interface TableSessionCustomization {
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}

export interface TableSessionItem {
  id: string;
  sessionId: string;
  orderRound: number;
  productId: string;
  productName: string;
  imageUrl?: string;
  sizeId?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizationTotal?: number;
  customizations?: TableSessionCustomization[];
  status: TableSessionItemStatus;
  customerNote?: string;
  createdAt: string;
}

export interface TableSessionRound {
  orderRound: number;
  roundItemsCount: number;
  roundTotal: number;
  createdAt: string;
  items: TableSessionItem[];
}

export interface TableSession {
  id: string;
  tableId: string;
  tableNumber: string;
  zone?: string;
  sessionNumber: string;
  status: TableSessionStatus;
  startedAt: string;
  endedAt?: string;
  totalItems: number;
  subtotal: number;
  customizationTotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  grandTotal?: number;
  items: TableSessionItem[];
  rounds?: TableSessionRound[];
}
