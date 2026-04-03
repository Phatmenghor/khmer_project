import { useAppSelector } from "@/redux/store";
import { selectBusinessColors } from "@/redux/features/business/store/selectors/business-settings-selector";

/**
 * Hook to get current business colors (primary, secondary, accent)
 * Colors are fetched from Redux business settings
 * Falls back to defaults if not yet loaded
 */
export function useBusinessColors() {
  const colors = useAppSelector(selectBusinessColors);

  return {
    primary: colors.primary,      // #57823D (Green) - Brand color
    secondary: colors.secondary,  // #F4C430 (Yellow) - Highlights & CTAs
    accent: colors.accent,        // #F2F3F7 (Grey) - Subtle backgrounds
  };
}
