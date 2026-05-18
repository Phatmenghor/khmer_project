import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "kh", "zh-CN"];
export const defaultLocale = "en";

export default getRequestConfig(async ({ locale }) => {

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }


  try {
    const messages = (await import(`./messages/${locale}.json`)).default;

    return {
      messages,
      locale,
    };
  } catch (error) {

    const fallbackMessages = (await import(`./messages/${defaultLocale}.json`))
      .default;
    return {
      locale: defaultLocale,
      messages: fallbackMessages,
    };
  }
});
