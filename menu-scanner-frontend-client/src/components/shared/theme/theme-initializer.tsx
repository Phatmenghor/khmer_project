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
    const localStorageValue = localStorage.getItem(localStorageKey);
    if (!localStorageValue) return;

    const cachedColors = JSON.parse(localStorageValue);
    if (cachedColors.businessName) {
      document.title = cachedColors.businessName;
    }
    // Primary color is now fixed in CSS — no dynamic theme application needed
  } catch {
    // localStorage / JSON parsing may fail in private mode; ignore.
  }
}
