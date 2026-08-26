import { appImages } from "@/constants/app-resource/icons/app-images";
import { AppDefault } from "@/constants/app-resource/default/default";

export type QRType = "attendance_kiosk" | "shop" | "table";

export type CardTemplate =
  | "primary-theme"
  | "bank-classic"
  | "aba-red"
  | "royal-purple"
  | "fresh-green"
  | "custom";

export interface QRConfig {
  type: QRType;
  businessId?: string;
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
  { value: "attendance_kiosk", label: "Attendance Station", description: "Universal QR" },
  { value: "shop",             label: "Shop Entry",         description: "Digital Menu" },
  { value: "table",            label: "Table QR",           description: "Table Ordering" },
];

export function generateQRUrl(config: QRConfig): string {
  const { type, tableNumber, businessId } = config;
  const base = (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000").replace(/\/$/, "");
  switch (type) {
    case "shop":
      return base;
    case "table": {
      const cleanNum = (tableNumber || "1").toString().replace(/^table-?/i, "").replace(/^#/i, "").trim();
      return `${base}/?table=${cleanNum}`;
    }
    case "attendance_kiosk": {
      return JSON.stringify({
        type: "BUSINESS_ATTENDANCE_KIOSK",
        businessId: businessId || AppDefault.BUSINESS_ID,
        name: config.cardTitle || "Attendance Kiosk",
      });
    }
    default:
      return base;
  }
}

export const DEFAULT_CONFIG: QRConfig = {
  type: "attendance_kiosk",
  businessId: AppDefault.BUSINESS_ID,
  shopId: "",
  tableNumber: "1",
  cardTitle: "",
  cardSubtitle: "Scan to Clock In / Out",
  scanText: "ATTENDANCE QR",
};

export const DEFAULT_STYLE: QRStyle = {
  primaryColor: "#966e30",
  backgroundColor: "#ffffff",
  logoDataUrl: appImages.scanmekhLogo,
  cardGradientFrom: "#966e30",
  cardGradientTo: "#684d21",
  template: "primary-theme",
  logoSize: 0.15,
};
