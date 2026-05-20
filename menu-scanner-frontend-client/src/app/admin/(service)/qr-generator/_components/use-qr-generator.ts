export type QRType = "shop" | "table" | "menu" | "product" | "custom";

export interface QRConfig {
  type: QRType;
  shopId: string;
  tableNumber: string;
  productId: string;
  customUrl: string;
  domain: string;
}

export interface QRStyle {
  size: number;
  primaryColor: string;
  backgroundColor: string;
  logoEnabled: boolean;
  logoDataUrl: string | null;
}

export const QR_TYPE_OPTIONS: Array<{
  value: QRType;
  label: string;
  description: string;
}> = [
  { value: "shop", label: "Shop Entry QR", description: "QR for shop entrance" },
  { value: "table", label: "Table QR", description: "QR for a specific table" },
  { value: "menu", label: "Menu QR", description: "QR for the full menu" },
  { value: "product", label: "Product QR", description: "QR for a specific product" },
  { value: "custom", label: "Custom URL", description: "Any custom URL" },
];

export function generateQRUrl(config: QRConfig): string {
  const { type, shopId, tableNumber, productId, customUrl, domain } = config;
  const base = domain.replace(/\/$/, "");

  switch (type) {
    case "shop":
      if (!shopId) return "";
      return `${base}/shop/${shopId}`;
    case "table":
      if (!shopId || !tableNumber) return "";
      return `${base}/shop/${shopId}/table/${tableNumber}`;
    case "menu":
      if (!shopId) return "";
      return `${base}/shop/${shopId}/menu`;
    case "product":
      if (!shopId || !productId) return "";
      return `${base}/shop/${shopId}/product/${productId}`;
    case "custom":
      return customUrl || "";
    default:
      return "";
  }
}

export const DEFAULT_CONFIG: QRConfig = {
  type: "shop",
  shopId: "",
  tableNumber: "1",
  productId: "",
  customUrl: "",
  domain: "https://your-domain.com",
};

export const DEFAULT_STYLE: QRStyle = {
  size: 300,
  primaryColor: "#000000",
  backgroundColor: "#ffffff",
  logoEnabled: false,
  logoDataUrl: null,
};
