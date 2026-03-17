"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/request";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSwitcherProps {
  currentLocale?: Locale;
  className?: string;
}

const languageNames: Record<Locale, string> = {
  en: "English",
  kh: "ខ្មែរ",
  "zh-CN": "中文",
};

const languageIcons: Record<Locale, string> = {
  en: "🇺🇸",
  kh: "🇰🇭",
  "zh-CN": "🇨🇳",
};

export function LanguageSwitcher({
  currentLocale = "en",
  className = "",
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState<Locale>(currentLocale);

  const handleLanguageChange = (newLocale: string) => {
    if (!locales.includes(newLocale as Locale)) return;

    const selectedLocale = newLocale as Locale;
    setLocale(selectedLocale);

    startTransition(() => {
      // Store in cookie and localStorage
      document.cookie = `locale=${selectedLocale}; path=/; max-age=${
        365 * 24 * 60 * 60
      }; SameSite=Lax`;
      localStorage.setItem("locale", selectedLocale);

      // Refresh to apply new locale
      router.refresh();
    });
  };

  return (
    <Select
      value={locale}
      onValueChange={handleLanguageChange}
      disabled={isPending}
    >
      <SelectTrigger className={`w-[140px] ${className}`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{languageIcons[locale]}</span>
            <span>{languageNames[locale]}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            <div className="flex items-center gap-2">
              <span>{languageIcons[loc]}</span>
              <span>{languageNames[loc]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
