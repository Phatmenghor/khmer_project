"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchStart, fetchSuccess, fetchFailure } from "@/store/slices/combobox-cache-slice";
import { AppDefault } from "@/constants/app-resource/default/default";
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
    async (newPage: number) => {
      if (!enabled) return;
      if (loadingRef.current) return;
      if (lastPageRef.current && newPage > 1) return;

      const requestKey = `${cacheKey}-page-${newPage}`;
      if (activeRequests.has(requestKey)) return;
      activeRequests.add(requestKey);

      dispatch(fetchStart(cacheKey));
      try {
        const result = await dispatch(
          thunkService({
            search: "",
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

  // Fetch page 1 when key changes or enabled transitions to true
  useEffect(() => {
    if (enabled && data.length === 0 && !loading) {
      fetchPage(1);
    }
  }, [enabled, cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll load next page
  useEffect(() => {
    if (inView && !lastPage && !loading && data.length > 0 && enabled) {
      fetchPage(currentPage + 1);
    }
  }, [inView, lastPage, loading, currentPage, data.length, enabled, fetchPage]);

  const filteredData = useMemo(() => {
    const prepend = prependFirstPage ? prependFirstPage(searchTerm) ?? [] : [];
    const cleanSearch = searchTerm.trim().toLowerCase();
    let listToFilter = [...prepend, ...data];
    if (listToFilter.length === 0 && !loading && fallbackData) {
      listToFilter = fallbackData;
    }
    if (!cleanSearch) return listToFilter;
    return listToFilter.filter((item: any) => {
      const name = item.name || item.provinceEn || item.districtEn || item.communeEn || item.villageEn || item.label || item.enumName || "";
      const nameKh = item.provinceKh || item.districtKh || item.communeKh || item.villageKh || "";
      return (
        name.toLowerCase().includes(cleanSearch) ||
        nameKh.toLowerCase().includes(cleanSearch)
      );
    });
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
