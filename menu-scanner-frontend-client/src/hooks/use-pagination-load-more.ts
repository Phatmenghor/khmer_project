"use client";

import { useRef, useCallback, useEffect } from "react";

const DEBOUNCE_DELAY = 100;


export function usePaginationLoadMore(
  onLoadMore: () => void,
  enabled: boolean = true,
  deps: any[] = []
) {

  const isProcessingRef = useRef(false);


  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);


  const lastLoadTimeRef = useRef(0);


  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);


  const resetLoadingState = useCallback(() => {
    isProcessingRef.current = false;
    lastLoadTimeRef.current = 0;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);


  useEffect(() => {
    resetLoadingState();
  }, deps);


const handleLoadMore = useCallback(() => {

  if (isProcessingRef.current) {
    return;
  }


  if (!enabled) {
    return;
  }


  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }


  debounceTimerRef.current = setTimeout(() => {

    if (!enabled || isProcessingRef.current) {
      return;
    }


    isProcessingRef.current = true;
    lastLoadTimeRef.current = Date.now();

    try {


      onLoadMore();
    } catch (error) {
      isProcessingRef.current = false;
    }


    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, DEBOUNCE_DELAY);
}, [onLoadMore, enabled]);


  const setLoading = useCallback((loading: boolean) => {
    if (!loading) {

      isProcessingRef.current = false;
    }
  }, []);

  return {
    handleLoadMore,
    setLoading,
    resetLoadingState,
    isProcessing: isProcessingRef.current,
  };
}
