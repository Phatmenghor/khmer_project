import { useState, useCallback } from "react";

interface UseLocalStorageOptions<T> {
  validateBeforeLoad?: (value: T) => boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
) {
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed = JSON.parse(item) as T;
      if (options?.validateBeforeLoad && !options.validateBeforeLoad(parsed)) {
        return initialValue;
      }
      return parsed;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (newValue: T) => {
      try {
        setValueState(newValue);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
      } catch {
        // ignore write errors
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setValueState(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore remove errors
    }
  }, [key, initialValue]);

  return { value, setValue, removeValue };
}
