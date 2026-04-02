import { useEffect } from "react";
import { fetchCurrentBusinessSettings } from "@/redux/features/business/store/services/business-settings-service";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

// Default brand colors from tailwind config
const DEFAULT_COLORS = {
  primary: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
  secondary: BUSINESS_SETTINGS_DEFAULTS.SECONDARY_COLOR,
  accent: BUSINESS_SETTINGS_DEFAULTS.ACCENT_COLOR,
};

// Convert hex color to HSL format for CSS variables
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert hex to RGB
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
}

export function useBusinessTheme() {
  useEffect(() => {
    const applyTheme = async () => {
      try {
        const settings = await fetchCurrentBusinessSettings();

        // Apply primary color
        const primaryColor = settings?.primaryColor || DEFAULT_COLORS.primary;
        const primaryHsl = hexToHsl(primaryColor);
        document.documentElement.style.setProperty("--primary", primaryHsl);

        // Apply secondary color
        const secondaryColor = settings?.secondaryColor || DEFAULT_COLORS.secondary;
        const secondaryHsl = hexToHsl(secondaryColor);
        document.documentElement.style.setProperty("--secondary", secondaryHsl);

        // Apply accent color
        const accentColor = settings?.accentColor || DEFAULT_COLORS.accent;
        const accentHsl = hexToHsl(accentColor);
        document.documentElement.style.setProperty("--accent", accentHsl);

        console.log("Business theme applied successfully", {
          primary: primaryHsl,
          secondary: secondaryHsl,
          accent: accentHsl,
        });
      } catch (error) {
        console.error("Failed to load business theme, using defaults:", error);

        // Apply default colors on error
        document.documentElement.style.setProperty(
          "--primary",
          hexToHsl(DEFAULT_COLORS.primary)
        );
        document.documentElement.style.setProperty(
          "--secondary",
          hexToHsl(DEFAULT_COLORS.secondary)
        );
        document.documentElement.style.setProperty(
          "--accent",
          hexToHsl(DEFAULT_COLORS.accent)
        );
      }
    };

    applyTheme();
  }, []);
}
