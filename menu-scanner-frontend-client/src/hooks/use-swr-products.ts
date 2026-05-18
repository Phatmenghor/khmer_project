"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPublicProducts } from '@/features/main/store/thunks/public-product-thunks';
import { selectProductListLoadingState } from '@/features/main/store/selectors/optimized-public-product-selectors';


const CACHE_PREFIX = 'swr:products';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}


class SwrCacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  constructor() {
    this.loadFromStorage();
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;


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
    }
  }

  private getStorageKey() {
    return `${CACHE_PREFIX}:data`;
  }
}

const cacheManager = new SwrCacheManager();


export function useSWRProducts(filters: any = {}, cacheTTL: number = DEFAULT_CACHE_TTL) {
  const dispatch = useDispatch<AppDispatch>();
  const [isStale, setIsStale] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);


  const products = useSelector((state: RootState) => state.publicProducts.products);
  const loadingState = useSelector(selectProductListLoadingState);
  const reduxError = useSelector((state: RootState) => state.publicProducts.error.list);


  const pendingFetchRef = useRef<Promise<any> | null>(null);


  const cacheKey = `${CACHE_PREFIX}:${JSON.stringify(filters)}`;


  useEffect(() => {
    if (hasInitialized) return;

    const cached = cacheManager.get(cacheKey);
    if (cached && cached.length > 0) {


      setIsStale(true);
      setHasInitialized(true);
    } else {

      setHasInitialized(true);
    }
  }, [cacheKey, hasInitialized]);


  const fetchFresh = useCallback(async () => {

    if (pendingFetchRef.current) {
      return pendingFetchRef.current;
    }

    try {
      setLocalError(null);
      const promise = dispatch(fetchPublicProducts(filters)).unwrap();
      pendingFetchRef.current = promise;

      const result = await promise;


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


  useEffect(() => {
    if (!hasInitialized) return;


    if (loadingState.isListLoading) return;

    if (isStale) {
      fetchFresh().catch((error) => {
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
    revalidate: fetchFresh,
  };
}


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
