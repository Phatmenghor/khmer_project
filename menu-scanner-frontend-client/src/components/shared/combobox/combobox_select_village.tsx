"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { VillageResponseModel } from "@/features/location/store/models/response/location-response";
import { fetchVillagesService } from "@/features/location/store/thunks/public-location-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";

interface ComboboxSelectVillageProps {
  dataSelect: VillageResponseModel | null;
  onChangeSelected: (item: VillageResponseModel | null) => void;
  communeCode?: string | null;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectVillage({
  dataSelect,
  onChangeSelected,
  communeCode,
  disabled = false,
  label = "Village / Phum",
  required = false,
  placeholder,
  error,
}: ComboboxSelectVillageProps) {
  const controller = useReduxCombobox<VillageResponseModel>({
    cacheKey: `villages-${communeCode || "none"}`,
    thunkService: fetchVillagesService,
    extraParams: { communeCode },
    enabled: !!communeCode,
  });

  const resolvedPlaceholder =
    placeholder ??
    (!communeCode ? "Select commune first" : "Select village...");

  const renderedLabel = label && !required ? `${label} (optional)` : label;

  return (
    <AsyncCombobox<VillageResponseModel>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.villageEn}
      renderItem={(item) => (
        <div className="flex items-center justify-between w-full">
          <span>{item.villageEn}</span>
          <span className="text-muted-foreground text-xs">{item.villageKh}</span>
        </div>
      )}
      label={renderedLabel}
      required={required}
      placeholder={resolvedPlaceholder}
      searchPlaceholder="Search village..."
      emptyMessage="No village found."
      error={error}
      disabled={disabled}
      beforeOpen={() => {
        if (!communeCode) {
          showToast.info(Messages.location.selectCommune);
          return false;
        }
        return true;
      }}
    />
  );
}
