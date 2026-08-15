import type { Metadata } from "next";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

const LOGO_PATH = "/assets/image/scanmekhlogo.png";

const LOGO_ICONS: Metadata["icons"] = {
  icon: LOGO_PATH,
  shortcut: LOGO_PATH,
  apple: LOGO_PATH,
};

export const buildMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  const name = businessName ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(appUrl),
    title: name
      ? { template: `%s | ${name}`, default: name }
      : undefined,
    description: name ? `${name} - Manage your restaurant operations` : undefined,
    keywords: name ? [name, "restaurant", "menu", "management", "scanner"] : undefined,
    authors: name ? [{ name }] : undefined,
    creator: name ?? undefined,
    icons: LOGO_ICONS,
    openGraph: name
      ? {
          title: name,
          description: `${name} - Manage your restaurant operations`,
          images: [{ url: LOGO_PATH }],
        }
      : undefined,
  };
};


export const buildAdminMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  const name = businessName ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(appUrl),
    title: name
      ? { template: `%s | ${name} Admin`, default: `${name} Admin` }
      : undefined,
    description: name ? `${name} Admin Panel - Manage your restaurant operations` : undefined,
    keywords: name ? [name, "admin", "restaurant", "menu", "management"] : undefined,
    icons: LOGO_ICONS,
  };
};


export const buildAuthMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  const name = businessName ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(appUrl),
    title: name ? `Sign In | ${name}` : "Sign In",
    description: name ? `Sign in to ${name}` : undefined,
    icons: LOGO_ICONS,
  };
};


export const buildPublicMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
  pageName?: string
): Metadata => {
  const name = businessName ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const title = pageName
    ? name ? `${pageName} | ${name}` : pageName
    : name || undefined;

  return {
    metadataBase: new URL(appUrl),
    title,
    description: name ? `Explore ${name} menu and place orders` : undefined,
    keywords: name ? [name, "menu", "order", "restaurant"] : undefined,
    icons: LOGO_ICONS,
  };
};
