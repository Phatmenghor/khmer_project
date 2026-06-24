"use client";

import { useMemo } from "react";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { fetchAllCategoriesService } from "@/features/master-data/store/thunks/categories-thunks";

interface ComboboxSelectCategoryProps {
  dataSelect: CategoriesResponseModel | null;
  onChangeSelected: (item: CategoriesResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  showAllOption?: boolean;
  error?: string;
}

const ALL_OPTION: CategoriesResponseModel = {
  id: "all",
  name: "All",
  description: "",
} as unknown as CategoriesResponseModel;

export function ComboboxSelectCategories({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Category",
  required = false,
  size = "md",
  placeholder = "Select a category...",
  showAllOption = true,
  error,
}: ComboboxSelectCategoryProps) {
  const prependFirstPage = useMemo(() => {
    if (!showAllOption) return undefined;
    return (search: string) => (search ? [] : [ALL_OPTION]);
  }, [showAllOption]);

  const controller = useReduxCombobox<CategoriesResponseModel>({
    cacheKey: "categories",
    thunkService: fetchAllCategoriesService,
    prependFirstPage,
  });

  return (
    <AsyncCombobox<CategoriesResponseModel>
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
      searchPlaceholder="Search category..."
      emptyMessage="No category found."
      endOfListMessage="No more categories"
      error={error}
      disabled={disabled}
      size={size}
    />
  );
}
