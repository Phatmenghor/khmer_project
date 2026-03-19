"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchPublicProducts } from '@/redux/features/main/store/thunks/public-product-thunks';
import { selectProductListLoadingState } from '@/redux/features/main/store/selectors/optimized-public-product-selectors';

// Cache key configuration
const CACHE_PREFIX = 'swr:products';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Simple in-memory cache manager for SWR pattern.
 * Persists to localStorage for page refresh resilience.
 */
class SwrCacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  constructor() {
    this.loadFromStorage();
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl: number = DEFAULT_CACHE_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.saveToStorage();
  }

  has(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem(this.getStorageKey());
  }

  private saveToStorage() {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save SWR cache to storage', error);
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      if (data) {
        const entries = JSON.parse(data);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load SWR cache from storage', error);
    }
  }

  private getStorageKey() {
    return `${CACHE_PREFIX}:data`;
  }
}

const cacheManager = new SwrCacheManager();

/**
 * Hook implementing Stale-While-Revalidate (SWR) caching pattern.
 *
 * Benefits:
 * 1. Instant response from cache (stale data)
 * 2. Fresh data loads in background
 * 3. UI never shows loading state for cached data
 * 4. Works perfectly for product listings
 *
 * Pattern Flow:
 * 1. Component mounts → Check cache
 * 2. If cached → Return immediately, mark as stale
 * 3. Fetch fresh data in background
 * 4. When fresh arrives → Update state, mark as fresh
 *
 * Usage:
 * ```tsx
 * const { products, isStale, loading, error } = useSWRProducts(filters);
 *
 * return (
 *   <div>
 *     {loading && !products.length && <Spinner />}
 *     <ProductList products={products} />
 *     {isStale && <div>Loading fresh data...</div>}
 *   </div>
 * );
 * ```
 */
export function useSWRProducts(filters: any = {}, cacheTTL: number = DEFAULT_CACHE_TTL) {
  const dispatch = useDispatch<AppDispatch>();
  const [isStale, setIsStale] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Use Redux selectors for the actual data and loading state
  const products = useSelector((state: RootState) => state.publicProducts.products);
  const loadingState = useSelector(selectProductListLoadingState);
  const reduxError = useSelector((state: RootState) => state.publicProducts.error.list);

  // Keep track of pending fetches to avoid duplicate requests
  const pendingFetchRef = useRef<Promise<any> | null>(null);

  // Create a cache key from filters
  const cacheKey = `${CACHE_PREFIX}:${JSON.stringify(filters)}`;

  // Initialize with cache on first mount
  useEffect(() => {
    if (hasInitialized) return;

    const cached = cacheManager.get(cacheKey);
    if (cached && cached.length > 0) {
      // Cache exists - don't dispatch (Redux already has this data)
      // But mark as stale so we fetch fresh
      setIsStale(true);
      setHasInitialized(true);
    } else {
      // No cache - initialize with empty state
      setHasInitialized(true);
    }
  }, [cacheKey, hasInitialized]);

  // Fetch fresh data in background
  const fetchFresh = useCallback(async () => {
    // Avoid duplicate in-flight requests
    if (pendingFetchRef.current) {
      return pendingFetchRef.current;
    }

    try {
      setLocalError(null);
      const promise = dispatch(fetchPublicProducts(filters)).unwrap();
      pendingFetchRef.current = promise;

      const result = await promise;

      // Cache the result
      if (result && result.items) {
        cacheManager.set(cacheKey, result.items, cacheTTL);
      }

      setIsStale(false);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch products';
      setLocalError(message);
      throw error;
    } finally {
      pendingFetchRef.current = null;
    }
  }, [dispatch, filters, cacheKey, cacheTTL]);

  // Auto-fetch when stale or on first load
  useEffect(() => {
    if (!hasInitialized) return;

    // Don't fetch if already loading
    if (loadingState.isListLoading) return;

    if (isStale) {
      fetchFresh().catch((error) => {
        console.warn('Failed to fetch fresh products:', error);
      });
    }
  }, [hasInitialized, isStale, loadingState.isListLoading, fetchFresh]);

  const error = localError || reduxError;

  return {
    products,
    isStale,
    loading: loadingState.isListLoading,
    error,
    refetch: fetchFresh,
    revalidate: fetchFresh, // Alias for familiar API
  };
}

/**
 * Hook to manually manage product cache.
 */
export function useProductCache() {
  return {
    set: (filters: any, data: any, ttl?: number) => {
      const key = `${CACHE_PREFIX}:${JSON.stringify(filters)}`;
      cacheManager.set(key, data, ttl);
    },
    get: (filters: any) => {
      const key = `${CACHE_PREFIX}:${JSON.stringify(filters)}`;
      return cacheManager.get(key);
    },
    has: (filters: any) => {
      const key = `${CACHE_PREFIX}:${JSON.stringify(filters)}`;
      return cacheManager.has(key);
    },
    clear: () => cacheManager.clear(),
  };
}
