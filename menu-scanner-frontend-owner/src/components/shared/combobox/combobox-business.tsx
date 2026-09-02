"use client";

import React, { useMemo } from "react";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { fetchAllBusinessService } from "@/features/subscription/store/thunks/business-thunks";

export interface BusinessOption {
  id: string;
  name: string;
}

const ALL_OPTION: BusinessOption = { id: "all", name: "All Businesses" };

interface ComboboxBusinessProps {
  value: BusinessOption | null;
  onChange: (item: BusinessOption | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  showAllOption?: boolean;
  error?: string;
}

export function ComboboxBusiness({
  value,
  onChange,
  disabled = false,
  label = "Business",
  required = false,
  size = "md",
  placeholder = "Select business...",
  showAllOption = true,
  error,
}: ComboboxBusinessProps) {
  const controller = useReduxCombobox<any>({
    cacheKey: "business-combobox",
    thunkService: fetchAllBusinessService,
  });

  const businessList = useMemo(() => {
    const mapped: BusinessOption[] = (controller.data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
    }));
    return showAllOption ? [ALL_OPTION, ...mapped] : mapped;
  }, [controller.data, showAllOption]);

  const selectedBusiness = useMemo(() => {
    if (!value) return null;
    return businessList.find((b) => b.id === value.id) || value;
  }, [businessList, value]);

  const modifiedController = {
    ...controller,
    data: businessList,
  };

  return (
    <AsyncCombobox<BusinessOption>
      value={selectedBusiness}
      onChange={(item) => {
        if (!item || item.id === "all") {
          onChange(null);
        } else {
          onChange(item);
        }
      }}
      controller={modifiedController as any}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => item?.name ?? ""}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search business..."
      emptyMessage="No business found."
      error={error}
      disabled={disabled}
      size={size}
    />
  );
}
