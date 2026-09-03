"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store";
import {
  logRouteNavigation,
  updateLastRouteDuration,
} from "@/store/slices/route-log-slice";
import { RouteLogger } from "@/utils/logging/route-logger";
import { ROUTE_LOG_CONFIG } from "@/constants/app-resource/config/route-log-config";

export function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const routeStartTimeRef = useRef<number>(Date.now());
  const isInitialRef = useRef<boolean>(true);

  useEffect(() => {
    if (!pathname) return;

    const now = Date.now();
    const durationMs = now - routeStartTimeRef.current;

    if (!isInitialRef.current && durationMs > 0) {
      dispatch(updateLastRouteDuration({ durationMs }));
    }

    routeStartTimeRef.current = now;

    const paramsObj: Record<string, string> = {};
    if (searchParams) {
      searchParams.forEach((value, key) => {
        paramsObj[key] = value;
      });
    }

    const searchString = searchParams?.toString();
    const fullPath = searchString ? `${pathname}?${searchString}` : pathname;

    const fullUrl = typeof window !== "undefined" ? window.location.href : fullPath;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const source = isInitialRef.current
      ? ROUTE_LOG_CONFIG.SOURCES.INITIAL_LOAD
      : ROUTE_LOG_CONFIG.SOURCES.CLIENT_NAVIGATION;

    dispatch(
      logRouteNavigation({
        pathname,
        searchParams: paramsObj,
        fullPath,
        fullUrl,
        origin,
        hostname,
        hash,
        source,
      })
    );

    RouteLogger.log({
      id: `route_${now}_${Math.random().toString(36).substring(2, 7)}`,
      pathname,
      searchParams: paramsObj,
      fullPath,
      fullUrl,
      origin,
      hostname,
      hash,
      previousPathname: null,
      previousFullUrl: null,
      timestamp: new Date(now).toISOString(),
      source,
    });

    isInitialRef.current = false;
  }, [pathname, searchParams, dispatch]);

  return null;
}
