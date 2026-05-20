export type QRType = "shop" | "table" | "menu" | "product" | "custom";

export type CardTemplate =
  | "bank-classic"
  | "aba-red"
  | "royal-purple"
  | "fresh-green"
  | "dark-mode"
  | "print-ready";

export interface QRConfig {
  type: QRType;
  shopId: string;
  tableNumber: string;
  productId: string;
  customUrl: string;
  domain: string;
  cardTitle: string;
  cardSubtitle: string;
}

export interface QRStyle {
  size: number;
  primaryColor: string;
  backgroundColor: string;
  logoEnabled: boolean;
  logoDataUrl: string | null;
  cardGradientFrom: string;
  cardGradientTo: string;
  template: CardTemplate;
}

export const QR_TYPE_OPTIONS: Array<{
  value: QRType;
  label: string;
  description: string;
}> = [
  { value: "shop",    label: "Shop Entry QR", description: "Shop entrance"    },
  { value: "table",   label: "Table QR",      description: "Specific table"   },
  { value: "menu",    label: "Menu QR",       description: "Full menu page"   },
  { value: "product", label: "Product QR",    description: "Specific product" },
  { value: "custom",  label: "Custom URL",    description: "Any custom URL"   },
];

export function generateQRUrl(config: QRConfig): string {
  const { type, shopId, tableNumber, productId, customUrl, domain } = config;
  const base = domain.replace(/\/$/, "");

  switch (type) {
    case "shop":    return shopId ? `${base}/shop/${shopId}` : "";
    case "table":   return shopId && tableNumber ? `${base}/shop/${shopId}/table/${tableNumber}` : "";
    case "menu":    return shopId ? `${base}/shop/${shopId}/menu` : "";
    case "product": return shopId && productId ? `${base}/shop/${shopId}/product/${productId}` : "";
    case "custom":  return customUrl || "";
    default:        return "";
  }
}

export const DEFAULT_CONFIG: QRConfig = {
  type: "shop",
  shopId: "",
  tableNumber: "1",
  productId: "",
  customUrl: "",
  domain: "https://your-domain.com",
  cardTitle: "",
  cardSubtitle: "Scan to view our menu",
};

export const DEFAULT_STYLE: QRStyle = {
  size: 300,
  primaryColor: "#1a237e",
  backgroundColor: "#ffffff",
  logoEnabled: false,
  logoDataUrl: null,
  cardGradientFrom: "#1a237e",
  cardGradientTo: "#283593",
  template: "bank-classic",
};
