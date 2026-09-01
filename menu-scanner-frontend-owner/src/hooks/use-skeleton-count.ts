import { useState, useEffect } from "react";


export interface SkeletonCountConfig {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  large?: number;
  xlarge?: number;
}


const DEFAULT_COUNTS: SkeletonCountConfig = {
  mobile: 4,
  tablet: 8,
  desktop: 10,
  large: 12,
  xlarge: 15,
};


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

  const [skeletonCount, setSkeletonCount] = useState(counts.desktop!);

  useEffect(() => {
    setSkeletonCount(getSkeletonCount(window.innerWidth));

    const handleResize = () => {
      setSkeletonCount(getSkeletonCount(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [counts.mobile, counts.tablet, counts.desktop, counts.large, counts.xlarge]);

  return skeletonCount;
}


export const SkeletonPresets = {

  productGrid: {
    mobile: 4,
    tablet: 6,
    desktop: 8,
    large: 10,
    xlarge: 12,
  },

  categoryGrid: {
    mobile: 4,
    tablet: 6,
    desktop: 8,
    large: 12,
    xlarge: 12,
  },

  listView: {
    mobile: 3,
    tablet: 5,
    desktop: 7,
    large: 10,
    xlarge: 12,
  },

  cardGrid: {
    mobile: 2,
    tablet: 4,
    desktop: 6,
    large: 8,
    xlarge: 10,
  },
};
