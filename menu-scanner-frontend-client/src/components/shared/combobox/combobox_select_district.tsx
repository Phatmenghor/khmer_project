"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { DistrictResponseModel } from "@/features/location/store/models/response/location-response";
import { fetchDistrictsService } from "@/features/location/store/thunks/public-location-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";

interface ComboboxSelectDistrictProps {
  dataSelect: DistrictResponseModel | null;
  onChangeSelected: (item: DistrictResponseModel | null) => void;
  provinceCode?: string | null;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectDistrict({
  dataSelect,
  onChangeSelected,
  provinceCode,
  disabled = false,
  label = "District / Khan",
  required = false,
  placeholder,
  error,
}: ComboboxSelectDistrictProps) {
  const controller = useReduxCombobox<DistrictResponseModel>({
    cacheKey: `districts-${provinceCode || "none"}`,
    thunkService: fetchDistrictsService,
    extraParams: { provinceCode },
    enabled: !!provinceCode,
  });

  const resolvedPlaceholder =
    placeholder ??
    (!provinceCode ? "Select province first" : "Select district...");

  return (
    <AsyncCombobox<DistrictResponseModel>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.districtEn}
      renderItem={(item) => (
        <div className="flex items-center justify-between w-full">
          <span>{item.districtEn}</span>
          <span className="text-muted-foreground text-xs">{item.districtKh}</span>
        </div>
      )}
      label={label}
      required={required}
      placeholder={resolvedPlaceholder}
      searchPlaceholder="Search district..."
      emptyMessage="No district found."
      error={error}
      disabled={disabled}
      beforeOpen={() => {
        if (!provinceCode) {
          showToast.info(Messages.location.selectProvince);
          return false;
        }
        return true;
      }}
    />
  );
}
