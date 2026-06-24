"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { ProvinceResponseModel } from "@/features/location/store/models/response/location-response";
import { fetchProvincesService } from "@/features/location/store/thunks/public-location-thunks";

interface ComboboxSelectProvinceProps {
  dataSelect: ProvinceResponseModel | null;
  onChangeSelected: (item: ProvinceResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectProvince({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Province / City",
  required = false,
  placeholder = "Select province...",
  error,
}: ComboboxSelectProvinceProps) {
  const controller = useReduxCombobox<ProvinceResponseModel>({
    cacheKey: "provinces",
    thunkService: fetchProvincesService,
  });

  return (
    <AsyncCombobox<ProvinceResponseModel>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.provinceEn}
      renderItem={(item) => (
        <div className="flex items-center justify-between w-full">
          <span>{item.provinceEn}</span>
          <span className="text-muted-foreground text-xs">{item.provinceKh}</span>
        </div>
      )}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search province..."
      emptyMessage="No province found."
      error={error}
      disabled={disabled}
    />
  );
}
