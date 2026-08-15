import { appImages } from "@/constants/app-resource/icons/app-images";

export type QRType = "shop" | "table";

export type CardTemplate =
  | "bank-classic"
  | "aba-red"
  | "royal-purple"
  | "fresh-green"
  | "custom";

export interface QRConfig {
  type: QRType;
  shopId: string;
  tableNumber: string;
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
  logoSize: number;
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
  const { type, tableNumber } = config;
  const base = (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000").replace(/\/$/, "");
  switch (type) {
    case "shop":
      return base;
    case "table": {
      const cleanNum = (tableNumber || "1").toString().replace(/^table-?/i, "").replace(/^#/i, "").trim();
      return `${base}/?table=${cleanNum}`;
    }
    default:
      return base;
  }
}

export const DEFAULT_CONFIG: QRConfig = {
  type: "shop",
  shopId: "",
  tableNumber: "1",
  cardTitle: "",
  cardSubtitle: "Scan to view our menu",
  scanText: "SCAN QR CODE",
};

export const DEFAULT_STYLE: QRStyle = {
  primaryColor: "#1a237e",
  backgroundColor: "#ffffff",
  logoDataUrl: appImages.scanmekhLogo,
  cardGradientFrom: "#1a237e",
  cardGradientTo: "#283593",
  template: "bank-classic",
  logoSize: 0.15,
};
