


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


export function ScrollRestorationWrapper({
  children,
  className,
  ...options
}: ScrollRestorationWrapperProps) {
  useScrollRestoration(options);

  return <div className={className}>{children}</div>;
}
