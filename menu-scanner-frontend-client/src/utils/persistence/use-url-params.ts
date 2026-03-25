import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Type-safe URL parameter management hook
 * Automatically handles encoding/decoding and type conversion
 */
interface UseUrlParamsOptions {
  shallow?: boolean; // Prevent page scroll on param update
}

export function useUrlParams(options: UseUrlParamsOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Get single param with type conversion
   */
  const getParam = useCallback(
    (key: string, defaultValue?: string): string | null => {
      return searchParams.get(key) ?? defaultValue ?? null;
    },
    [searchParams]
  );

  /**
   * Get all params as object
   */
  const getAllParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  /**
   * Set single param
   */
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "");
    },
    [searchParams, router]
  );

  /**
   * Set multiple params at once
   */
  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "");
    },
    [searchParams, router]
  );

  /**
   * Clear all params
   */
  const clearParams = useCallback(() => {
    router.push("");
  }, [router]);

  /**
   * Check if param exists
   */
  const hasParam = useCallback(
    (key: string): boolean => {
      return searchParams.has(key);
    },
    [searchParams]
  );

  /**
   * Remove single param
   */
  const removeParam = useCallback(
    (key: string) => {
      setParam(key, null);
    },
    [setParam]
  );

  /**
   * Remove multiple params
   */
  const removeParams = useCallback(
    (keys: string[]) => {
      const updates: Record<string, null> = {};
      keys.forEach((key) => {
        updates[key] = null;
      });
      setParams(updates);
    },
    [setParams]
  );

  return {
    getParam,
    getAllParams,
    setParam,
    setParams,
    clearParams,
    hasParam,
    removeParam,
    removeParams,
  };
}

/**
 * Helper to convert URL params to typed object
 */
export function useTypedUrlParams<T extends Record<string, any>>(
  schema: Record<string, (val: string | null) => any>
): Partial<T> & { update: (updates: Partial<T>) => void } {
  const urlParams = useUrlParams();

  const typed = Object.entries(schema).reduce(
    (acc, [key, converter]) => {
      acc[key as keyof T] = converter(urlParams.getParam(key));
      return acc;
    },
    {} as Partial<T>
  );

  const update = (updates: Partial<T>) => {
    const urlUpdates: Record<string, string | null> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        urlUpdates[key] = null;
      } else {
        urlUpdates[key] = String(value);
      }
    });
    urlParams.setParams(urlUpdates);
  };

  return { ...typed, update };
}
