"use client";

import { ReactNode, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { locales, defaultLocale, type Locale } from "@/i18n/request";

interface LocaleProviderProps {
  children: ReactNode;
  initialMessages: any;
  initialLocale: Locale;
}

/**
 * Get stored locale from cookies or localStorage
 */
function getStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  try {
    // Check localStorage first
    const stored = localStorage.getItem("locale");
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }

    // Check cookies as fallback
    const cookieMatch = document.cookie.match(/locale=([^;]+)/);
    if (cookieMatch && locales.includes(cookieMatch[1] as Locale)) {
      return cookieMatch[1] as Locale;
    }
  } catch (error) {
    console.error("Could not read stored locale:", error);
  }

  return defaultLocale;
}

/**
 * Store locale in both cookie and localStorage
 */
function storeLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  localStorage.setItem("locale", locale);
  document.cookie = `locale=${locale}; path=/; max-age=${
    365 * 24 * 60 * 60
  }; SameSite=Lax`;
}

export function LocaleProvider({
  children,
  initialMessages,
  initialLocale,
}: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  // Check for stored locale on mount
  useEffect(() => {
    const storedLocale = getStoredLocale();
    if (storedLocale !== locale) {
      loadLocale(storedLocale);
    }
  }, []);

  /**
   * Load messages for a specific locale
   */
  const loadLocale = async (newLocale: Locale) => {
    if (newLocale === locale && messages) return;

    setIsLoading(true);
    try {
      const newMessages = await import(`../messages/${newLocale}.json`);
      setMessages(newMessages.default);
      setLocale(newLocale);
      storeLocale(newLocale);
    } catch (error) {
      console.error("Failed to load locale:", newLocale, error);
      // Fallback to default locale
      if (newLocale !== defaultLocale) {
        loadLocale(defaultLocale);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NextIntlClientProvider
      messages={messages}
      locale={locale}
      timeZone="Asia/Phnom_Penh"
    >
      {children}
    </NextIntlClientProvider>
  );
}
