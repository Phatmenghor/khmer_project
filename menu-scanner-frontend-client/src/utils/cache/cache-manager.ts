"use client";

import React from "react";

/**
 * Cache entry with TTL (Time To Live)
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  key: string;
}

/**
 * Cache manager with TTL support
 * Automatically expires old cache entries
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<any>>();
  private memoryCache = new Map<string, CacheEntry<any>>();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttlMs;
  }

  /**
   * Set cache with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
      key,
    };

    // Store in memory (always)
    this.memoryCache.set(key, entry);

    // Store in localStorage if possible (for persistence)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (e) {
        console.warn(`Failed to cache ${key} to localStorage:`, e);
      }
    }
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    // Try memory first
    let entry = this.memoryCache.get(key);

    // Fallback to localStorage
    if (!entry && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          // Restore to memory cache
          this.memoryCache.set(key, entry);
        }
      } catch (e) {
        console.warn(`Failed to load ${key} from localStorage:`, e);
      }
    }

    // Check if expired
    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }

    // Remove expired entry
    this.memoryCache.delete(key);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`cache_${key}`);
    }

    return null;
  }

  /**
   * Check if cache exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache
   */
  clear(key: string): void {
    this.memoryCache.delete(key);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`cache_${key}`);
    }
  }

  /**
   * Clear all cache for a pattern
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.memoryCache.delete(key);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`cache_${key}`);
      }
    });
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.memoryCache.clear();
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("cache_")) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { memory: number; localStorage: number } {
    let localStorageSize = 0;
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("cache_")) {
          localStorageSize += localStorage.getItem(key)?.length || 0;
        }
      });
    }

    return {
      memory: this.memoryCache.size,
      localStorage: localStorageSize,
    };
  }
}

export const cacheManager = CacheManager.getInstance();

/**
 * Cache time constants (in milliseconds)
 */
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Hook to use cache with React
 */
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = CACHE_TTL.MEDIUM
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(() => cacheManager.get(key));
  const [loading, setLoading] = React.useState(!data);
  const [error, setError] = React.useState<Error | null>(null);

  const fetch = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      cacheManager.set(key, result, ttlMs);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttlMs]);

  React.useEffect(() => {
    const cached = cacheManager.get(key);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      fetch();
    }
  }, [key]);

  return { data, loading, error, refetch: fetch };
}
