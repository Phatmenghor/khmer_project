import dynamic from "next/dynamic";

/**
 * Lazy-loaded footer component
 * Only renders on client side to avoid hydration issues with cached data
 * Does NOT show loading state - footer appears without blocking page render
 */
export const FooterLazy = dynamic(
  () => import("./footer").then((mod) => ({ default: mod.Footer })),
  {
    loading: () => null, // No loading state - page renders immediately
    ssr: false, // Only render on client
  }
);
