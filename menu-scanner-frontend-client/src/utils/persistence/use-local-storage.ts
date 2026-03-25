import { useCallback, useEffect, useState } from "react";

/**
 * Type-safe localStorage hook with serialization
 * Handles JSON stringify/parse automatically
 */
interface UseLocalStorageOptions {
  sync?: boolean; // Sync across browser tabs
  validateBeforeLoad?: (value: any) => boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
) {
  const { sync = true, validateBeforeLoad } = options;

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage when component mounts
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (validateBeforeLoad && !validateBeforeLoad(parsed)) {
          console.warn(`Invalid data in localStorage for key: ${key}`);
          setStoredValue(initialValue);
        } else {
          setStoredValue(parsed);
        }
      }
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      setStoredValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue, validateBeforeLoad]);

  // Set value in localStorage and state
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
      }
    },
    [key, storedValue]
  );

  // Update value in localStorage and state
  const updateValue = useCallback(
    (updates: Partial<T>) => {
      setValue((prev) => ({ ...prev, ...updates }));
    },
    [setValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }, [key, initialValue]);

  // Listen for storage changes in other tabs
  useEffect(() => {
    if (!sync) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          if (!validateBeforeLoad || validateBeforeLoad(newValue)) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(`Error syncing from other tab (${key}):`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, sync, validateBeforeLoad]);

  return {
    value: storedValue,
    setValue,
    updateValue,
    removeValue,
    isLoading,
  };
}

/**
 * Hook for managing structured localStorage data with expiration
 */
interface CachedValue<T> {
  data: T;
  timestamp: number;
}

export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryMinutes: number = 60
) {
  const storage = useLocalStorage<CachedValue<T> | null>(
    `${key}_cached`,
    null,
    {
      validateBeforeLoad: (value) => {
        if (!value || !value.data || !value.timestamp) return false;
        const age = (Date.now() - value.timestamp) / 1000 / 60;
        return age < expiryMinutes;
      },
    }
  );

  const getValue = useCallback((): T => {
    if (storage.value && storage.value.data) {
      return storage.value.data;
    }
    return initialValue;
  }, [storage.value, initialValue]);

  const setValue = useCallback(
    (value: T) => {
      storage.setValue({
        data: value,
        timestamp: Date.now(),
      });
    },
    [storage]
  );

  const isExpired = useCallback((): boolean => {
    if (!storage.value || !storage.value.timestamp) return true;
    const age = (Date.now() - storage.value.timestamp) / 1000 / 60;
    return age >= expiryMinutes;
  }, [storage.value, expiryMinutes]);

  return {
    value: getValue(),
    setValue,
    isExpired,
    clear: storage.removeValue,
  };
}

/**
 * Hook for batch localStorage operations
 */
export function useLocalStorageBatch(prefix: string = "") {
  const getKey = (name: string) => (prefix ? `${prefix}:${name}` : name);

  const set = useCallback(
    (data: Record<string, any>) => {
      Object.entries(data).forEach(([key, value]) => {
        try {
          window.localStorage.setItem(getKey(key), JSON.stringify(value));
        } catch (error) {
          console.error(`Error setting ${key}:`, error);
        }
      });
    },
    [getKey]
  );

  const get = useCallback(
    (key: string, defaultValue?: any) => {
      try {
        const item = window.localStorage.getItem(getKey(key));
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error(`Error getting ${key}:`, error);
        return defaultValue;
      }
    },
    [getKey]
  );

  const getAll = useCallback(() => {
    const prefixKey = prefix ? `${prefix}:` : "";
    const data: Record<string, any> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefixKey)) {
        const cleanKey = prefix ? key.replace(prefixKey, "") : key;
        try {
          data[cleanKey] = JSON.parse(window.localStorage.getItem(key) || "");
        } catch (error) {
          console.error(`Error parsing ${key}:`, error);
        }
      }
    }
    return data;
  }, [prefix]);

  const clear = useCallback(() => {
    const prefixKey = prefix ? `${prefix}:` : "";
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefixKey)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }, [prefix]);

  return { set, get, getAll, clear };
}
