"use client";

import { useMemo } from "react";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { fetchAllBrandService } from "@/features/master-data/store/thunks/brand-thunks";

interface ComboboxSelectBrandProps {
  dataSelect?: BrandResponseModel | null;
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
  const prependFirstPage = useMemo(() => {
    if (!showAllOption) return undefined;
    return (search: string) => (search ? [] : [ALL_OPTION]);
  }, [showAllOption]);

  const controller = useReduxCombobox<BrandResponseModel>({
    cacheKey: "brands",
    thunkService: fetchAllBrandService,
    prependFirstPage,
  });

  return (
    <AsyncCombobox<BrandResponseModel>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => item?.name ?? ""}
      onSelectInterceptor={(item) => (!item || item.id === "all" ? null : item)}
      isItemSelected={(item, value) =>
        item?.id === "all" ? !value : value?.id === item?.id
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
