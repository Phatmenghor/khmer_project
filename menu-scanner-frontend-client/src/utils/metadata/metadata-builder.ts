import type { Metadata } from "next";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";


export const buildMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  const name = businessName ?? "";
  return {
    title: name
      ? { template: `%s | ${name}`, default: name }
      : undefined,
    description: name ? `${name} - Manage your restaurant operations` : undefined,
    keywords: name ? [name, "restaurant", "menu", "management", "scanner"] : undefined,
    authors: name ? [{ name }] : undefined,
    creator: name ?? undefined,
  };
};


export const buildAdminMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  const name = businessName ?? "";
  return {
    title: name
      ? { template: `%s | ${name} Admin`, default: `${name} Admin` }
      : undefined,
    description: name ? `${name} Admin Panel - Manage your restaurant operations` : undefined,
    keywords: name ? [name, "admin", "restaurant", "menu", "management"] : undefined,
  };
};


export const buildAuthMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  const name = businessName ?? "";
  return {
    title: name ? `Sign In | ${name}` : "Sign In",
    description: name ? `Sign in to ${name}` : undefined,
  };
};


export const buildPublicMetadata = (
  businessName: string | null = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
  pageName?: string
): Metadata => {
  const name = businessName ?? "";
  const title = pageName
    ? name ? `${pageName} | ${name}` : pageName
    : name || undefined;

  return {
    title,
    description: name ? `Explore ${name} menu and place orders` : undefined,
    keywords: name ? [name, "menu", "order", "restaurant"] : undefined,
  };
};
