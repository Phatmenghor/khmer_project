export type QRType = "shop" | "table";

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
  domain: string;
  cardTitle: string;
  cardSubtitle: string;
  scanText: string;
}

export interface QRStyle {
  primaryColor: string;
  backgroundColor: string;
  logoDataUrl: string | null;
  cardGradientFrom: string;
  cardGradientTo: string;
  template: CardTemplate;
  logoSize: number; // 0.1–0.5, fraction of QR area the logo occupies
}

export const QR_TYPE_OPTIONS: Array<{
  value: QRType;
  label: string;
  description: string;
}> = [
  { value: "shop",  label: "Shop Entry QR", description: "Shop entrance" },
  { value: "table", label: "Table QR",      description: "Specific table" },
];

export function generateQRUrl(config: QRConfig): string {
  const { type, shopId, tableNumber, domain } = config;
  const base = domain.replace(/\/$/, "");
  switch (type) {
    case "shop":  return shopId ? `${base}/shop/${shopId}` : "";
    case "table": return shopId && tableNumber ? `${base}/shop/${shopId}/table/${tableNumber}` : "";
    default:      return "";
  }
}

export const DEFAULT_CONFIG: QRConfig = {
  type: "shop",
  shopId: "",
  tableNumber: "1",
  domain: "https://your-domain.com",
  cardTitle: "",
  cardSubtitle: "Scan to view our menu",
  scanText: "SCAN QR CODE",
};

export const DEFAULT_STYLE: QRStyle = {
  primaryColor: "#1a237e",
  backgroundColor: "#ffffff",
  logoDataUrl: null,
  cardGradientFrom: "#1a237e",
  cardGradientTo: "#283593",
  template: "bank-classic",
  logoSize: 0.15,
};
