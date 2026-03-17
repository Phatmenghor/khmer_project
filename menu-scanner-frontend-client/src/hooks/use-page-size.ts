import { useState, useEffect } from "react";

const PAGE_SIZE_COOKIE_KEY = "admin_table_page_size";
const DEFAULT_PAGE_SIZE = 10;

/**
 * Custom hook to manage table page size with cookie persistence
 *
 * @param defaultSize - Default page size if no cookie is found (default: 10)
 * @returns [pageSize, setPageSize] - Current page size and setter function
 *
 * @example
 * ```tsx
 * const [pageSize, setPageSize] = usePageSize(20);
 *
 * <DataTableWithPagination
 *   pageSize={pageSize}
 *   onPageSizeChange={setPageSize}
 *   ...
 * />
 * ```
 */
export function usePageSize(defaultSize: number = DEFAULT_PAGE_SIZE): [number, (size: number) => void] {
  const [pageSize, setPageSizeState] = useState<number>(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      return defaultSize;
    }

    // Try to get page size from cookie
    const cookieValue = getCookie(PAGE_SIZE_COOKIE_KEY);
    if (cookieValue) {
      const parsed = parseInt(cookieValue, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return defaultSize;
  });

  const setPageSize = (size: number) => {
    if (size > 0) {
      setPageSizeState(size);
      // Save to cookie (expires in 1 year)
      setCookie(PAGE_SIZE_COOKIE_KEY, size.toString(), 365);
    }
  };

  return [pageSize, setPageSize];
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}

/**
 * Set a cookie
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") {
    return;
  }

  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }

  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
