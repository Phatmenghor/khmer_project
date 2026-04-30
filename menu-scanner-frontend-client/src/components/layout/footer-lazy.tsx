import dynamic from "next/dynamic";

/**
 * Lazy-loaded footer component
 * Only renders on client side to avoid hydration issues with cached data
 * Loads only when footer section becomes visible
 */
export const FooterLazy = dynamic(
  () => import("./footer").then((mod) => ({ default: mod.Footer })),
  {
    loading: () => (
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-20 bg-gray-800 rounded mb-4" />
        </div>
      </footer>
    ),
    ssr: false, // Only render on client
  }
);
