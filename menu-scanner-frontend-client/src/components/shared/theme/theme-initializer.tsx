"use client";

import { useEffect } from "react";

/**
 * ThemeInitializer - Apply cached theme colors as early as possible
 * This component should run as soon as possible to prevent color flash
 */
export function ThemeInitializer() {
  useEffect(() => {
    // Apply cached colors immediately (runs after hydration)
    initializeTheme();
  }, []);

  return null;
}

/**
 * Initialize theme colors from cache
 * Gets business ID from various sources and applies cached colors
 */
function initializeTheme() {
  try {
    // Try to get business ID from multiple sources
    let businessId: string | null = null;

    // 1. Check localStorage first (fastest, set on login)
    businessId = localStorage.getItem("businessId");

    // 2. If not found, check from URL or page context
    if (!businessId && typeof window !== "undefined") {
      // Try to get from sessionStorage as fallback
      businessId = sessionStorage.getItem("businessId");

      // Try to get from cookie (BusinessId cookie if it exists)
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith("businessId=")) {
          businessId = decodeURIComponent(cookie.substring("businessId=".length));
          break;
        }
      }
    }

    if (!businessId) {
      console.log("[THEME] No business ID found, using defaults");
      return;
    }

    // Get cached colors from cookie
    const cookieName = `theme_colors_${businessId}`;
    const cookies = document.cookie.split(";");
    let cachedColorsStr: string | null = null;

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(cookieName + "=")) {
        cachedColorsStr = decodeURIComponent(
          cookie.substring((cookieName + "=").length)
        );
        break;
      }
    }

    if (!cachedColorsStr) {
      console.log(
        `[THEME] No cached colors for business ${businessId}, using defaults`
      );
      return;
    }

    try {
      const cachedColors = JSON.parse(cachedColorsStr);
      console.log(
        `[THEME INIT] Applying cached colors for business ${businessId}`
      );

      // Apply colors immediately
      applyThemeColorsSync(
        cachedColors.primaryColor,
        cachedColors.secondaryColor,
        cachedColors.accentColor
      );
    } catch (e) {
      console.error("[THEME] Failed to parse cached colors:", e);
    }
  } catch (error) {
    console.error("[THEME INIT] Error initializing theme:", error);
  }
}

/**
 * Apply theme colors synchronously (hex to HSL conversion)
 */
function applyThemeColorsSync(
  primaryColor?: string,
  secondaryColor?: string,
  accentColor?: string
): void {
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

  if (secondaryColor) {
    const hsl = hexToHsl(secondaryColor);
    if (hsl) {
      document.documentElement.style.setProperty("--secondary", hsl);
    }
  }

  if (accentColor) {
    const hsl = hexToHsl(accentColor);
    if (hsl) {
      document.documentElement.style.setProperty("--accent", hsl);
    }
  }
}
