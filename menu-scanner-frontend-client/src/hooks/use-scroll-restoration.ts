


import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  useScrollState,
  useScrollPosition,
} from "@/features/main/store/state/scroll-state";

export interface UseScrollRestorationOptions {


  enabled?: boolean;


  debounceMs?: number;


  restoreOnMount?: boolean;


  includeSearchParams?: boolean;


  customKey?: string;


  restoreDelay?: number;
}


function isPageRefresh(): boolean {

  if (typeof window === "undefined" || !window.performance) {
    return false;
  }


  const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  if (navigationEntries.length > 0) {
    return navigationEntries[0].type === "reload";
  }


  const navigation = (performance as any).navigation;
  if (navigation) {
    return navigation.type === 1;
  }

  return false;
}


export function useScrollRestoration(options: UseScrollRestorationOptions = {}) {
  const {
    enabled = true,
    debounceMs = 150,
    restoreOnMount = true,
    includeSearchParams = false,
    customKey,
    restoreDelay = 100,
  } = options;

  const pathname = usePathname();
  const { saveScrollPosition, setCurrentRoute, clearScrollPosition } = useScrollState();

  const hasMounted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const restoreTimeoutRef = useRef<NodeJS.Timeout>();


  const search = typeof window !== "undefined" ? window.location.search : "";
  const routeKey = customKey
    ? customKey
    : includeSearchParams && search
    ? `${pathname}${search}`
    : pathname;


  const savedScrollPosition = useScrollPosition(routeKey);


  useEffect(() => {
    if (!enabled || !restoreOnMount || hasMounted.current) return;

    hasMounted.current = true;
    setCurrentRoute(routeKey);


    const isRefresh = isPageRefresh();

    if (isRefresh) {

      clearScrollPosition(routeKey);
      window.scrollTo({ top: 0, behavior: "auto" });
    } else if (savedScrollPosition > 0) {

      restoreTimeoutRef.current = setTimeout(() => {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: "auto",
        });
      }, restoreDelay);
    }

    return () => {
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
    };
  }, [enabled, restoreOnMount, routeKey, savedScrollPosition, restoreDelay, setCurrentRoute, clearScrollPosition]);


  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const scrollY = window.scrollY;
        saveScrollPosition(routeKey, scrollY);
      }, debounceMs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, routeKey, debounceMs, saveScrollPosition]);

  return {
    routeKey,
    scrollPosition: savedScrollPosition,
  };
}


export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
}
