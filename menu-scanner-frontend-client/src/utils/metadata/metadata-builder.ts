import type { Metadata } from "next";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";


export const buildMetadata = (
  businessName: string = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  return {
    title: {
      template: `%s | ${businessName}`,
      default: businessName,
    },
    description: `${businessName} - Manage your restaurant operations`,
    keywords: [businessName, "restaurant", "menu", "management", "scanner"],
    authors: [{ name: businessName }],
    creator: businessName,
  };
};


export const buildAdminMetadata = (
  businessName: string = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  return {
    title: {
      template: `%s | ${businessName} Admin`,
      default: `${businessName} Admin`,
    },
    description: `${businessName} Admin Panel - Manage your restaurant operations`,
    keywords: [businessName, "admin", "restaurant", "menu", "management"],
  };
};


export const buildAuthMetadata = (
  businessName: string = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
): Metadata => {
  return {
    title: `Sign In | ${businessName}`,
    description: `Sign in to ${businessName}`,
  };
};


export const buildPublicMetadata = (
  businessName: string = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
  pageName?: string
): Metadata => {
  const title = pageName
    ? `${pageName} | ${businessName}`
    : businessName;

  return {
    title,
    description: `Explore ${businessName} menu and place orders`,
    keywords: [businessName, "menu", "order", "restaurant"],
  };
};
