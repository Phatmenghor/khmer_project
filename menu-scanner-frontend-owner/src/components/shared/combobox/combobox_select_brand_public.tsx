"use client";

import { memo } from "react";
import { Tag } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { fetchPublicBrands } from "@/features/main/store/thunks/public-brands-thunks";

interface ComboboxSelectBrandPublicProps {
  selectedBrand: string;
  onChangeSelected: (brandId: string) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
}

const ALL_OPTION: BrandResponseModel = {
  id: "",
  name: "All",
  description: "",
} as unknown as BrandResponseModel;

function ComboboxSelectBrandPublicComponent({
  selectedBrand,
  onChangeSelected,
  disabled = false,
  label = "Brand",
  size = "md",
  placeholder = "All Brands",
}: ComboboxSelectBrandPublicProps) {
  const controller = useReduxCombobox<BrandResponseModel>({
    cacheKey: "brands_public",
    thunkService: fetchPublicBrands,
    extraParams: { status: "ACTIVE" },
    prependFirstPage: (search) => (search ? [] : [ALL_OPTION]),
  });

  const value = controller.data.find((b) => b.id === selectedBrand) || null;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-purple-500/10">
            <Tag className="h-2.5 w-2.5 text-purple-500" />
          </div>
          <Label className="text-xs font-medium text-foreground">{label}</Label>
        </div>
      )}
      <AsyncCombobox<BrandResponseModel>
        value={value}
        onChange={(item) => onChangeSelected(item ? item.id : "")}
        controller={controller}
        getId={(item) => item?.id ?? ""}
        getLabel={(item) => item?.name ?? ""}
        placeholder={placeholder}
        searchPlaceholder="Search brand..."
        emptyMessage="No brand found."
        endOfListMessage="No more brands"
        disabled={disabled}
        size={size}
      />
    </div>
  );
}

export const ComboboxSelectBrandPublic = memo(ComboboxSelectBrandPublicComponent);
