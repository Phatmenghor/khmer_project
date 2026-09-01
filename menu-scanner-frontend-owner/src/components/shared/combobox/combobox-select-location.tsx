"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { fetchAllLocationsService } from "@/features/location/store/thunks/location-thunks";

interface Location {
  id: string;
  fullAddress: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber: string;
  houseNumber: string;
  note: string;
  latitude: number;
  longitude: number;
  [key: string]: unknown;
}

interface ComboboxSelectLocationProps {
  dataSelect?: Location | null;
  onChangeSelected: (item: Location | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  hasDefault?: boolean;
}

export function ComboboxSelectLocation({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Delivery Address",
  required = false,
  placeholder = "Select address...",
  error,
  hasDefault = false,
}: ComboboxSelectLocationProps) {
  const router = useRouter();
  const controller = useReduxCombobox<Location>({
    cacheKey: "locations",
    thunkService: fetchAllLocationsService,
  });

  if (!hasDefault && controller.data.length === 0 && !controller.loading) {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <Label className="text-xs font-semibold">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <CustomButton
          onClick={() => router.push("/account/addresses")}
          variant="outline"
          className="w-full h-[32px] text-base md:text-sm gap-1"
        >
          <Plus className="h-2.5 w-2.5" />
          Add Address
        </CustomButton>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  const emptyElement = (
    <div className="flex flex-col items-center gap-1 py-1 text-xs">
      <span>No address found</span>
      <CustomButton
        onClick={() => {
          router.push("/account/addresses");
        }}
        variant="outline"
        size="sm"
        className="h-5 text-xs gap-1"
      >
        <Plus className="h-2 w-2" />
        Add Address
      </CustomButton>
    </div>
  );

  return (
    <AsyncCombobox<Location>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => item?.fullAddress ?? ""}
      renderItem={(item) => {
        if (!item) return null;
        return (
          <div className="flex items-center justify-between w-full text-xs">
            <span className="truncate line-clamp-1 flex-1">{item.fullAddress}</span>
            {item.note && (
              <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
                ({item.note})
              </span>
            )}
          </div>
        );
      }}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search address..."
      emptyMessage={emptyElement}
      error={error}
      disabled={disabled}
    />
  );
}
