import { useEffect, useState, useRef, useCallback } from "react";


export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue((prev) => {
        if (prev === value) return prev;
        return value;
      });
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function debounce<
  T extends (...args: Parameters<T>) => void | Promise<void>
>(func: T, delay: number = 400) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Custom hook to debounce an async action by key/id.
 * Allows instant local state mutation (optimistic UI), while debouncing
 * background API network requests per item key.
 */
export function useDebouncedItemCallback<K extends string | number, A extends any[]>(
  callback: (key: K, ...args: A) => Promise<void> | void,
  delay: number = 400
) {
  const timersRef = useRef<Map<K, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return useCallback(
    (key: K, ...args: A) => {
      const existingTimer = timersRef.current.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const newTimer = setTimeout(() => {
        timersRef.current.delete(key);
        callback(key, ...args);
      }, delay);

      timersRef.current.set(key, newTimer);
    },
    [callback, delay]
  );
}

