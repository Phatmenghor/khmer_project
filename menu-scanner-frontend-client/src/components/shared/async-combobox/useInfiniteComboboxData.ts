"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/utils/debounce/debounce";
import type {
  UseInfiniteComboboxOptions,
  UseInfiniteComboboxResult,
} from "./types";

const DEFAULT_PAGE_SIZE = 15;
const DEFAULT_DEBOUNCE_MS = 400;

export function useInfiniteComboboxData<T, P extends object = object>(
  options: UseInfiniteComboboxOptions<T, P>
): UseInfiniteComboboxResult<T> {
  const {
    fetcher,
    extraParams,
    enabled = true,
    pageSize = DEFAULT_PAGE_SIZE,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    getId,
    prependFirstPage,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, debounceMs);
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.5 });

  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);
  useEffect(() => {
    loadingRef.current = loading;
    lastPageRef.current = lastPage;
  }, [loading, lastPage]);

  const fetcherRef = useRef(fetcher);
  const prependRef = useRef(prependFirstPage);
  const getIdRef = useRef(getId);
  useEffect(() => {
    fetcherRef.current = fetcher;
    prependRef.current = prependFirstPage;
    getIdRef.current = getId;
  });

  const extraParamsKey = extraParams ? JSON.stringify(extraParams) : "";

  const dedupe = useCallback((items: T[]): T[] => {
    const seen = new Set<string | number>();
    const out: T[] = [];
    for (const item of items) {
      const id = getIdRef.current(item);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(item);
    }
    return out;
  }, []);

  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (search: string, newPage: number) => {
      if (!enabled) return;
      if (loadingRef.current) return;
      if (lastPageRef.current && newPage > 1) return;

      const reqId = ++requestIdRef.current;
      setLoading(true);

      try {
        const result = await fetcherRef.current({
          search,
          pageNo: newPage,
          pageSize,
          ...((extraParams ?? {}) as P),
        });

        if (reqId !== requestIdRef.current) return;
        if (!result) return;

        if (newPage === 1) {
          const prepend = prependRef.current?.(search) ?? [];
          setData(dedupe([...prepend, ...result.content]));
        } else {
          setData((prev) => dedupe([...prev, ...result.content]));
        }

        setPage(result.pageNo);
        setLastPage(result.last);
      } catch {
        // Swallow — matches existing behavior across all 17 comboboxes
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [enabled, pageSize, extraParams, dedupe]
  );

  useEffect(() => {
    setPage(1);
    setLastPage(false);
    setData([]);
    if (enabled) {
      fetchPage(debouncedSearch, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, enabled, extraParamsKey]);

  useEffect(() => {
    if (
      inView &&
      enabled &&
      !loadingRef.current &&
      !lastPageRef.current &&
      data.length > 0
    ) {
      fetchPage(debouncedSearch, page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, page, data.length, enabled]);

  const reset = useCallback(() => {
    setSearchTerm("");
    setPage(1);
    setLastPage(false);
    setData([]);
  }, []);

  return {
    data,
    loading,
    lastPage,
    searchTerm,
    setSearchTerm,
    reset,
    sentinelRef,
  };
}
