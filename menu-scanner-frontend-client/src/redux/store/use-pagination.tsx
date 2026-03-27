import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UsePaginationOptions {
  baseRoute: string;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // When provided, syncs the URL pageNo into Redux on mount/change (removes boilerplate useEffect from every page)
  syncPageToRedux?: (page: number) => void;
}

interface UsePaginationReturn {
  currentPage: number;
  updateUrlWithPage: (newPage: number, replace?: boolean) => void;
  handlePageChange: (newPage: number) => void;
  getDisplayIndex: (index: number, pageSize: number) => number;
}

export function usePagination({
  baseRoute,
  totalPages,
  onPageChange,
  syncPageToRedux,
}: UsePaginationOptions): UsePaginationReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = useMemo(() => {
    const pageParam = searchParams.get("pageNo");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  // Sync URL pageNo → Redux whenever URL changes (replaces repeated useEffect in every page)
  useEffect(() => {
    if (syncPageToRedux) {
      syncPageToRedux(currentPage);
    }
  }, [currentPage, syncPageToRedux]);

  const updateUrlWithPage = useCallback(
    (newPage: number, replace: boolean = false) => {
      const params = new URLSearchParams(searchParams);
      params.set("pageNo", newPage.toString());
      const url = `${baseRoute}?${params.toString()}`;
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [searchParams, router, baseRoute]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (totalPages && (newPage < 1 || newPage > totalPages)) return;
      if (newPage < 1) return;
      if (newPage === currentPage) return;
      updateUrlWithPage(newPage);
      if (onPageChange) onPageChange(newPage);
    },
    [currentPage, updateUrlWithPage, onPageChange, totalPages]
  );

  const getDisplayIndex = useCallback(
    (index: number, pageSize: number) => (currentPage - 1) * pageSize + index + 1,
    [currentPage]
  );

  return { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex };
}
