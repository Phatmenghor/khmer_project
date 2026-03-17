// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "kh", "zh-CN"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from request
  let locale = await requestLocale;

  // Validate and fallback to default if invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;

    return {
      locale,
      messages,
      timeZone: "Asia/Phnom_Penh",
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);

    // Fallback to default locale
    const fallbackMessages = (await import(`../messages/${defaultLocale}.json`))
      .default;

    return {
      locale: defaultLocale,
      messages: fallbackMessages,
      timeZone: "Asia/Phnom_Penh",
    };
  }
});
