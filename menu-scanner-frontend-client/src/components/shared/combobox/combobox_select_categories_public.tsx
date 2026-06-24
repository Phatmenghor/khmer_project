"use client";

import { memo } from "react";
import { Package } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { fetchPublicCategories } from "@/features/main/store/thunks/public-categories-thunks";

interface ComboboxSelectCategoriesPublicProps {
  selectedCategory: string;
  onChangeSelected: (categoryId: string) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
}

const ALL_OPTION: CategoriesResponseModel = {
  id: "",
  name: "All",
  description: "",
} as unknown as CategoriesResponseModel;

function ComboboxSelectCategoriesPublicComponent({
  selectedCategory,
  onChangeSelected,
  disabled = false,
  label = "Category",
  size = "md",
  placeholder = "All Categories",
}: ComboboxSelectCategoriesPublicProps) {
  const controller = useReduxCombobox<CategoriesResponseModel>({
    cacheKey: "categories_public",
    thunkService: fetchPublicCategories,
    extraParams: { status: "ACTIVE" },
    prependFirstPage: (search) => (search ? [] : [ALL_OPTION]),
  });

  const value = controller.data.find((c) => c.id === selectedCategory) || null;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-500/10">
            <Package className="h-2.5 w-2.5 text-blue-500" />
          </div>
          <Label className="text-xs font-medium text-foreground">{label}</Label>
        </div>
      )}
      <AsyncCombobox<CategoriesResponseModel>
        value={value}
        onChange={(item) => onChangeSelected(item ? item.id : "")}
        controller={controller}
        getId={(item) => item.id}
        getLabel={(item) => item.name}
        placeholder={placeholder}
        searchPlaceholder="Search category..."
        emptyMessage="No categories found."
        endOfListMessage="No more categories"
        disabled={disabled}
        size={size}
      />
    </div>
  );
}

export const ComboboxSelectCategoriesPublic = memo(
  ComboboxSelectCategoriesPublicComponent
);
