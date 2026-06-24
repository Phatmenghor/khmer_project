"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { CommuneResponseModel } from "@/features/location/store/models/response/location-response";
import { fetchCommunesService } from "@/features/location/store/thunks/public-location-thunks";
import { showToast } from "@/components/shared/common/show-toast";

interface ComboboxSelectCommuneProps {
  dataSelect: CommuneResponseModel | null;
  onChangeSelected: (item: CommuneResponseModel | null) => void;
  districtCode?: string | null;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectCommune({
  dataSelect,
  onChangeSelected,
  districtCode,
  disabled = false,
  label = "Commune / Sangkat",
  required = false,
  placeholder,
  error,
}: ComboboxSelectCommuneProps) {
  const controller = useReduxCombobox<CommuneResponseModel>({
    cacheKey: `communes-${districtCode || "none"}`,
    thunkService: fetchCommunesService,
    extraParams: { districtCode },
    enabled: !!districtCode,
  });

  const resolvedPlaceholder =
    placeholder ??
    (!districtCode ? "Select district first" : "Select commune...");

  return (
    <AsyncCombobox<CommuneResponseModel>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.communeEn}
      renderItem={(item) => (
        <div className="flex items-center justify-between w-full">
          <span>{item.communeEn}</span>
          <span className="text-muted-foreground text-xs">{item.communeKh}</span>
        </div>
      )}
      label={label}
      required={required}
      placeholder={resolvedPlaceholder}
      searchPlaceholder="Search commune..."
      emptyMessage="No commune found."
      error={error}
      disabled={disabled}
      beforeOpen={() => {
        if (!districtCode) {
          showToast.info("Please select a district first");
          return false;
        }
        return true;
      }}
    />
  );
}
