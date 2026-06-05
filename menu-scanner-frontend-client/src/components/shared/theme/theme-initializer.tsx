"use client";

import { useEffect } from "react";


export function ThemeInitializer() {
  useEffect(() => {
    initializeTheme();

    // Re-apply when browser restores page from bfcache (back/forward navigation)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) initializeTheme();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}

function initializeTheme() {
  try {
    const businessId = localStorage.getItem('businessId') || '550cad56-cafd-4aba-baef-c4dcd53940d0';
    const localStorageKey = 'theme_colors_' + businessId;
    let cachedColors = null;

    try {
      const localStorageValue = localStorage.getItem(localStorageKey);
      if (localStorageValue) {
        cachedColors = JSON.parse(localStorageValue);
      }
    } catch {}

    if (!cachedColors) {
      const cookieName = 'theme_colors_' + businessId;
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(cookieName + '=')) {
          const value = decodeURIComponent(cookie.substring((cookieName + '=').length));
          cachedColors = JSON.parse(value);
          break;
        }
      }
    }

    if (!cachedColors) return;

    if (cachedColors.businessName) {
      document.title = cachedColors.businessName;
    }

    applyThemeColorsSync(cachedColors.primaryColor);
  } catch {
    // localStorage / cookie / JSON parsing may fail in private mode; ignore.
  }
}

function applyThemeColorsSync(primaryColor?: string): void {
  const hexToHsl = (hex: string): string => {
    if (!hex || !hex.startsWith("#")) return "";

    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return `${hue} ${saturation}% ${lightness}%`;
  };

  if (primaryColor) {
    const hsl = hexToHsl(primaryColor);
    if (hsl) {
      document.documentElement.style.setProperty("--primary", hsl);
    }
  }
}
