"use client";

import { useCallback, useMemo } from "react";
import {
  AsyncCombobox,
  useInfiniteComboboxData,
  type AsyncFetcher,
} from "@/components/shared/async-combobox";
import { useAppDispatch } from "@/store";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { fetchAllBrandService } from "@/features/master-data/store/thunks/brand-thunks";

interface ComboboxSelectBrandProps {
  dataSelect: BrandResponseModel | null;
  onChangeSelected: (item: BrandResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  showAllOption?: boolean;
  error?: string;
}

const ALL_OPTION: BrandResponseModel = {
  id: "all",
  name: "All",
  description: "",
} as unknown as BrandResponseModel;

export function ComboboxSelectBrand({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Brand",
  required = false,
  size = "md",
  placeholder = "Select a brand...",
  showAllOption = true,
  error,
}: ComboboxSelectBrandProps) {
  const dispatch = useAppDispatch();

  const fetcher = useCallback<AsyncFetcher<BrandResponseModel>>(
    async ({ search, pageNo, pageSize }) => {
      return dispatch(
        fetchAllBrandService({ search, pageNo, pageSize })
      ).unwrap();
    },
    [dispatch]
  );

  const prependFirstPage = useMemo(() => {
    if (!showAllOption) return undefined;
    return (search: string) => (search ? [] : [ALL_OPTION]);
  }, [showAllOption]);

  const controller = useInfiniteComboboxData<BrandResponseModel>({
    fetcher,
    getId: (item) => item.id,
    prependFirstPage,
  });

  return (
    <AsyncCombobox<BrandResponseModel>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.name}
      onSelectInterceptor={(item) => (item.id === "all" ? null : item)}
      isItemSelected={(item, value) =>
        item.id === "all" ? !value : value?.id === item.id
      }
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search brand..."
      emptyMessage="No brand found."
      endOfListMessage="No more brands"
      error={error}
      disabled={disabled}
      size={size}
    />
  );
}
