import type { ReactNode, RefCallback } from "react";

export interface PaginatedResult<T> {
  content: T[];
  pageNo: number;
  last: boolean;
}

export interface PaginatedRequest {
  search: string;
  pageNo: number;
  pageSize: number;
}

export type AsyncFetcher<T, P extends object = object> = (
  params: PaginatedRequest & P
) => Promise<PaginatedResult<T> | null | undefined>;

export interface UseInfiniteComboboxOptions<T, P extends object = object> {
  fetcher: AsyncFetcher<T, P>;
  extraParams?: P;
  enabled?: boolean;
  pageSize?: number;
  debounceMs?: number;
  getId: (item: T) => string | number;
  prependFirstPage?: (search: string) => T[] | null | undefined;
}

export interface UseInfiniteComboboxResult<T> {
  data: T[];
  loading: boolean;
  lastPage: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  reset: () => void;
  sentinelRef: RefCallback<Element>;
}

export type ComboboxSize = "sm" | "md" | "lg";

export interface AsyncComboboxProps<T> {
  value?: T | null;
  onChange: (item: T | null) => void;
  controller: UseInfiniteComboboxResult<T>;
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  isItemSelected?: (item: T, value: T | null | undefined) => boolean;
  onSelectInterceptor?: (item: T) => T | null;

  label?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  endOfListMessage?: string;
  error?: string;
  disabled?: boolean;
  size?: ComboboxSize;
  className?: string;

  prefillSearchOnOpen?: boolean;
  beforeOpen?: () => boolean;
}
