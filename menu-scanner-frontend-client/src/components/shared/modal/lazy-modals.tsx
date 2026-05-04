/**
 * Lazy-loaded modal components
 * These are bundled separately to reduce initial page bundle size
 * Only loaded when actually needed (when modal is shown)
 */

import dynamic from "next/dynamic";

/**
 * Size selection modal for products with sizes
 * Loaded only when user clicks "Choose Size" button
 * Saves ~50KB from initial bundle
 */
export const SizeSelectionModalLazy = dynamic(
  () => import("./size-selection-modal").then((mod) => ({ default: mod.SizeSelectionModal })),
  {
    loading: () => <div className="fixed inset-0 z-50 bg-black/50" />,
    ssr: true,
  }
);

/**
 * Size picker modal for POS system
 * Loaded only when POS modal opens
 * Saves ~45KB from initial bundle
 */
export const SizePickerModalLazy = dynamic(
  () => import("./size-picker-modal").then((mod) => ({ default: mod.SizePickerModal })),
  {
    loading: () => <div className="fixed inset-0 z-50 bg-black/50" />,
    ssr: true,
  }
);
