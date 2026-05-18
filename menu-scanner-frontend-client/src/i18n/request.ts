
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "kh", "zh-CN"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {

  let locale = await requestLocale;


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

    const fallbackMessages = (await import(`../messages/${defaultLocale}.json`))
      .default;

    return {
      locale: defaultLocale,
      messages: fallbackMessages,
      timeZone: "Asia/Phnom_Penh",
    };
  }
});
