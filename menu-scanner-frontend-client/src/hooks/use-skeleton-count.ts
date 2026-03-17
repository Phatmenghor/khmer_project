import { useState, useEffect } from "react";

/**
 * Responsive skeleton count configuration
 */
export interface SkeletonCountConfig {
  mobile?: number; // < 640px
  tablet?: number; // >= 640px && < 1024px
  desktop?: number; // >= 1024px && < 1280px
  large?: number; // >= 1280px && < 1536px
  xlarge?: number; // >= 1536px
}

/**
 * Default skeleton counts for different screen sizes
 */
const DEFAULT_COUNTS: SkeletonCountConfig = {
  mobile: 4,
  tablet: 8,
  desktop: 10,
  large: 12,
  xlarge: 15,
};

/**
 * Hook to get responsive skeleton count based on screen size
 * @param customCounts - Optional custom counts for different breakpoints
 * @returns Current skeleton count based on screen size
 */
export function useSkeletonCount(
  customCounts?: SkeletonCountConfig
): number {
  const counts = { ...DEFAULT_COUNTS, ...customCounts };

  const getSkeletonCount = (width: number): number => {
    if (width < 640) return counts.mobile!;
    if (width < 1024) return counts.tablet!;
    if (width < 1280) return counts.desktop!;
    if (width < 1536) return counts.large!;
    return counts.xlarge!;
  };

  const [skeletonCount, setSkeletonCount] = useState(() =>
    typeof window !== "undefined" ? getSkeletonCount(window.innerWidth) : counts.desktop!
  );

  useEffect(() => {
    const handleResize = () => {
      setSkeletonCount(getSkeletonCount(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [counts.mobile, counts.tablet, counts.desktop, counts.large, counts.xlarge]);

  return skeletonCount;
}

/**
 * Preset configurations for common use cases
 */
export const SkeletonPresets = {
  // Product grids
  productGrid: {
    mobile: 4,
    tablet: 6,
    desktop: 8,
    large: 10,
    xlarge: 12,
  },
  // Category/Brand grids
  categoryGrid: {
    mobile: 4,
    tablet: 6,
    desktop: 8,
    large: 12,
    xlarge: 12,
  },
  // List views
  listView: {
    mobile: 3,
    tablet: 5,
    desktop: 7,
    large: 10,
    xlarge: 12,
  },
  // Card grids
  cardGrid: {
    mobile: 2,
    tablet: 4,
    desktop: 6,
    large: 8,
    xlarge: 10,
  },
};
