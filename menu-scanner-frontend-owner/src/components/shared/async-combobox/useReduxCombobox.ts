"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchStart, fetchSuccess, fetchFailure } from "@/store/slices/combobox-cache-slice";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useDebounce } from "@/utils/debounce/debounce";
import type { UseInfiniteComboboxResult } from "./types";

const activeRequests = new Set<string>();

export function useReduxCombobox<T>(options: {
  cacheKey: string;
  thunkService: any;
  extraParams?: any;
  enabled?: boolean;
  prependFirstPage?: (search: string) => T[] | null | undefined;
  fallbackData?: T[];
}): UseInfiniteComboboxResult<T> {
  const { cacheKey, thunkService, extraParams, enabled = true, prependFirstPage, fallbackData } = options;
  const dispatch = useAppDispatch();

  const cache = useAppSelector((state) => state.comboboxCache.caches[cacheKey]);
  const loading = useAppSelector((state) => state.comboboxCache.loading[cacheKey] || false);

  const [searchTerm, setSearchTerm] = useState("");
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.5 });

  const data = cache?.content || [];
  const lastPage = cache?.last ?? false;
  const currentPage = cache?.pageNo ?? 1;

  const loadingRef = useRef(loading);
  const lastPageRef = useRef(lastPage);
  useEffect(() => {
    loadingRef.current = loading;
    lastPageRef.current = lastPage;
  }, [loading, lastPage]);

  const extraParamsKey = extraParams ? JSON.stringify(extraParams) : "";

  const fetchPage = useCallback(
    async (newPage: number, searchParam?: string) => {
      if (!enabled) return;
      if (loadingRef.current) return;
      if (lastPageRef.current && newPage > 1 && !searchParam) return;

      const currentSearch = searchParam !== undefined ? searchParam : searchTerm;
      const requestKey = `${cacheKey}-page-${newPage}-search-${currentSearch}`;
      if (activeRequests.has(requestKey)) return;
      activeRequests.add(requestKey);

      dispatch(fetchStart(cacheKey));
      try {
        const result = await dispatch(
          thunkService({
            search: currentSearch,
            pageNo: newPage,
            pageSize: AppDefault.DEFAULT_PAGE_SIZE,
            ...extraParams,
          })
        ).unwrap();

        if (result) {
          dispatch(
            fetchSuccess({
              key: cacheKey,
              content: result.content || [],
              pageNo: result.pageNo || newPage,
              last: result.last ?? true,
            })
          );
        } else {
          dispatch(fetchFailure({ key: cacheKey, error: "Empty response" }));
        }
      } catch (err: any) {
        dispatch(fetchFailure({ key: cacheKey, error: err?.message || "Failed to fetch" }));
      } finally {
        activeRequests.delete(requestKey);
      }
    },
    [dispatch, cacheKey, thunkService, enabled, extraParamsKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Fetch initial page 1 on mount if cache is empty
  useEffect(() => {
    if (enabled && data.length === 0 && !loading) {
      fetchPage(1, "");
    }
  }, [enabled, cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll load next page
  useEffect(() => {
    if (inView && !lastPage && !loading && data.length > 0 && enabled) {
      fetchPage(currentPage + 1, searchTerm);
    }
  }, [inView, lastPage, loading, currentPage, data.length, enabled, fetchPage]);

  // Debounced API search (350ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 350);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    fetchPage(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, enabled, cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredData = useMemo(() => {
    const prepend = prependFirstPage ? prependFirstPage(searchTerm) ?? [] : [];
    let listToFilter = [...prepend, ...data];
    if (listToFilter.length === 0 && !loading && fallbackData) {
      listToFilter = fallbackData;
    }
    return listToFilter;
  }, [data, searchTerm, prependFirstPage, loading, fallbackData]);

  return {
    data: filteredData,
    loading,
    lastPage,
    searchTerm,
    setSearchTerm,
    reset: () => {},
    sentinelRef,
  };
}
