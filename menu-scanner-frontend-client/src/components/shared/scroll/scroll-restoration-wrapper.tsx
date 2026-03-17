/**
 * Scroll Restoration Wrapper Component
 * Wraps page content and automatically handles scroll restoration
 */

"use client";

import { ReactNode } from "react";
import {
  useScrollRestoration,
  UseScrollRestorationOptions,
} from "@/hooks/use-scroll-restoration";

export interface ScrollRestorationWrapperProps
  extends UseScrollRestorationOptions {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component for automatic scroll restoration
 * Usage:
 * ```tsx
 * <ScrollRestorationWrapper>
 *   <YourPageContent />
 * </ScrollRestorationWrapper>
 * ```
 */
export function ScrollRestorationWrapper({
  children,
  className,
  ...options
}: ScrollRestorationWrapperProps) {
  useScrollRestoration(options);

  return <div className={className}>{children}</div>;
}
