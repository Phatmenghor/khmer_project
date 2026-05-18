"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SCROLL_POSITIONS_KEY = "scroll-positions";

export function ScrollReset() {
  const pathname = usePathname();
  const isRestoringRef = useRef(false);
  const restorationAttempts = useRef(0);

  useEffect(() => {

    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }

    return () => {
      if (typeof window !== "undefined") {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    restorationAttempts.current = 0;


    const restoreScroll = () => {
      try {
        const saved = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
        if (saved) {
          const positions = JSON.parse(saved);
          const scrollY = positions[pathname];

          if (typeof scrollY === "number" && scrollY > 0) {
            isRestoringRef.current = true;

            const restore = () => {
              window.scrollTo({
                top: scrollY,
                left: 0,
                behavior: "instant",
              });
            };


            restore();
            setTimeout(restore, 0);
            setTimeout(restore, 50);
            setTimeout(restore, 100);
            setTimeout(restore, 200);


            setTimeout(() => {
              restore();
              isRestoringRef.current = false;
            }, 300);
          } else {

            window.scrollTo(0, 0);
            isRestoringRef.current = false;
          }
        } else {
          window.scrollTo(0, 0);
          isRestoringRef.current = false;
        }
      } catch (error) {
        window.scrollTo(0, 0);
        isRestoringRef.current = false;
      }
    };


    restoreScroll();
  }, [pathname]);

  useEffect(() => {
    let rafId: number | null = null;
    let lastKnownScrollY = window.scrollY;


    const handleScroll = () => {
      if (isRestoringRef.current) return;

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        lastKnownScrollY = window.scrollY;
        rafId = null;
      });
    };


    const saveScroll = () => {
      if (isRestoringRef.current) return;

      try {
        const currentPath = window.location.pathname;
        const saved = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
        const positions = saved ? JSON.parse(saved) : {};

        positions[currentPath] = lastKnownScrollY;


        const keys = Object.keys(positions);
        if (keys.length > 20) {
          const sorted = keys.sort();
          const toKeep = sorted.slice(-20);
          const newPositions: Record<string, number> = {};
          toKeep.forEach((key) => {
            newPositions[key] = positions[key];
          });
          sessionStorage.setItem(
            SCROLL_POSITIONS_KEY,
            JSON.stringify(newPositions)
          );
        } else {
          sessionStorage.setItem(
            SCROLL_POSITIONS_KEY,
            JSON.stringify(positions)
          );
        }
      } catch (error) {
      }
    };


    window.addEventListener("scroll", handleScroll, { passive: true });


    const saveBeforeNavigation = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        lastKnownScrollY = window.scrollY;
      }
      saveScroll();
    };


    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      saveBeforeNavigation();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      saveBeforeNavigation();
      return originalReplaceState.apply(this, args);
    };


    window.addEventListener("popstate", saveBeforeNavigation);


    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveBeforeNavigation();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);


    window.addEventListener("beforeunload", saveBeforeNavigation);


    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.href) {
        saveBeforeNavigation();
      }
    };
    document.addEventListener("click", handleClick, true);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", saveBeforeNavigation);
      window.removeEventListener("beforeunload", saveBeforeNavigation);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleClick, true);


      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
}
