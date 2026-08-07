export enum ReceiptSize {
  SIZE_58MM = "SIZE_58MM",
  SIZE_80MM = "SIZE_80MM",
  SIZE_112MM = "SIZE_112MM",
}

export const RECEIPT_SIZE_CONFIG = {
  [ReceiptSize.SIZE_58MM]: {
    label: "Small receipt (58mm)",
    description: "Small shops, simple POS, mobile POS",
  },
  [ReceiptSize.SIZE_80MM]: {
    label: "Standard receipt (80mm)",
    description: "Restaurants, retail stores, supermarkets (most common)",
  },
  [ReceiptSize.SIZE_112MM]: {
    label: "Large receipt (112mm)",
    description: "Detailed invoices, warehouse, enterprise POS",
  },
};
