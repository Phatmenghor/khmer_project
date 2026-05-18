/**
 * Hook for managing dynamic filter state
 * Simplifies filter management across multiple pages
 *
 * Usage:
 * ```tsx
 * const {
 *   filters,
 *   updateFilter,
 *   resetFilters,
 *   getFilterValue,
 * } = useDynamicFilters(initialFilters);
 * ```
 */

import { useCallback } from 'react';

export interface DynamicFiltersState {
  [key: string]: any;
}

export interface UseDynamicFiltersResult {
  filters: DynamicFiltersState;
  updateFilter: (filterId: string, value: any) => void;
  resetFilters: () => void;
  getFilterValue: (filterId: string) => any;
}

export const useDynamicFilters = (
  initialFilters: DynamicFiltersState,
  onFiltersChange?: (filters: DynamicFiltersState) => void
): UseDynamicFiltersResult => {
  const updateFilter = useCallback(
    (filterId: string, value: any) => {
      const updatedFilters = {
        ...initialFilters,
        [filterId]: value,
      };
      onFiltersChange?.(updatedFilters);
    },
    [initialFilters, onFiltersChange]
  );

  const resetFilters = useCallback(() => {
    onFiltersChange?.(initialFilters);
  }, [initialFilters, onFiltersChange]);

  const getFilterValue = useCallback(
    (filterId: string) => {
      return initialFilters[filterId];
    },
    [initialFilters]
  );

  return {
    filters: initialFilters,
    updateFilter,
    resetFilters,
    getFilterValue,
  };
};
