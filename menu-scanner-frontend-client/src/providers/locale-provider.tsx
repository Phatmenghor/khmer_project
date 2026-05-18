"use client";

import { Messages } from "@/constants/messages";

import { ReactNode, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { locales, defaultLocale, type Locale } from "@/i18n/request";

interface LocaleProviderProps {
  children: ReactNode;
  initialMessages: any;
  initialLocale: Locale;
}


function getStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  try {

    const stored = localStorage.getItem("locale");
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }


    const cookieMatch = document.cookie.match(/locale=([^;]+)/);
    if (cookieMatch && locales.includes(cookieMatch[1] as Locale)) {
      return cookieMatch[1] as Locale;
    }
  } catch (error) {
  }

  return defaultLocale;
}


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


  useEffect(() => {
    const storedLocale = getStoredLocale();
    if (storedLocale !== locale) {
      loadLocale(storedLocale);
    }
  }, []);


  const loadLocale = async (newLocale: Locale) => {
    if (newLocale === locale && messages) return;

    setIsLoading(true);
    try {
      const newMessages = await import(`../messages/${newLocale}.json`);
      setMessages(newMessages.default);
      setLocale(newLocale);
      storeLocale(newLocale);
    } catch (error) {

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
