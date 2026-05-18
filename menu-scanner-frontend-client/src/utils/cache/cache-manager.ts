"use client";

import React from "react";


export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  key: string;
}


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


  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttlMs;
  }


  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
      key,
    };


    this.memoryCache.set(key, entry);


    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (e) {
      }
    }
  }


  get<T>(key: string): T | null {

    let entry = this.memoryCache.get(key);


    if (!entry && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);

          this.memoryCache.set(key, entry);
        }
      } catch (e) {
      }
    }


    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }


    this.memoryCache.delete(key);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`cache_${key}`);
    }

    return null;
  }


  has(key: string): boolean {
    return this.get(key) !== null;
  }


  clear(key: string): void {
    this.memoryCache.delete(key);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`cache_${key}`);
    }
  }


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


export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,
  MEDIUM: 30 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  VERY_LONG: 24 * 60 * 60 * 1000,
};


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
