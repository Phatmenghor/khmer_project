"use client";

import React, { useMemo } from "react";
import { Controller, Control, FieldValues, Path, FieldError } from "react-hook-form";
import { AsyncMultiSelectCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { fetchAllUsersService } from "@/features/auth/store/thunks/users-thunks";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { formatEnumValue } from "@/utils/format/enum-formatter";

interface ComboboxMultiSelectUserInnerProps {
  selectedUserIds: string[];
  onChangeSelectedUserIds: (ids: string[]) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  showSelectAll?: boolean;
}

function ComboboxMultiSelectUserInner({
  selectedUserIds = [],
  onChangeSelectedUserIds,
  disabled = false,
  label = "Assign Staff Members",
  required = false,
  placeholder = "Select staff or leave blank for all",
  error,
  showSelectAll = false,
}: ComboboxMultiSelectUserInnerProps) {
  // Infinite Scroll & Pagination Page Size 15 using useReduxCombobox
  const controller = useReduxCombobox<UserResponseModel>({
    cacheKey: "users-multi-select-15",
    thunkService: fetchAllUsersService,
    extraParams: { pageSize: 15 },
  });

  const selectedObjects = useMemo(() => {
    const dataMap = new Map(controller.data.map((u) => [u.id, u]));
    return selectedUserIds.map((id) => {
      const found = dataMap.get(id);
      if (found) return found;
      return {
        id,
        firstName: "Staff",
        lastName: "",
        fullName: "Staff Member",
      } as UserResponseModel;
    });
  }, [selectedUserIds, controller.data]);

  return (
    <AsyncMultiSelectCombobox<UserResponseModel>
      selectedValues={selectedObjects}
      onChange={(items) => onChangeSelectedUserIds(items.map((i) => i.id))}
      controller={controller}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => item?.fullName || `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "Staff Member"}
      showSelectAll={showSelectAll}
      selectAllLabel="Select All Staff Members"
      renderItem={(item) => {
        if (!item) return null;
        const name = item.fullName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Staff Member";
        const formattedRoles = item.roles && item.roles.length > 0
          ? item.roles.map((r) => formatEnumValue(r)).join(", ")
          : null;

        return (
          <div className="flex flex-col min-w-0 py-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{name}</span>
              {formattedRoles && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 truncate">
                  {formattedRoles}
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate">
              {item.email || item.phoneNumber || "Staff Member"}
            </span>
          </div>
        );
      }}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search user..."
      emptyMessage="No user found."
      error={error}
      disabled={disabled}
      subLabel={
        selectedUserIds.length === 0
          ? "General Shift (All Staff)"
          : `${selectedUserIds.length} Selected`
      }
    />
  );
}

export interface ComboboxMultiSelectUserProps<T extends FieldValues = FieldValues> {
  name?: Path<T>;
  control?: Control<T>;
  selectedUserIds?: string[];
  onChangeSelectedUserIds?: (ids: string[]) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: FieldError | string;
  showSelectAll?: boolean;
}

export function ComboboxMultiSelectUser<T extends FieldValues = FieldValues>({
  name,
  control,
  selectedUserIds = [],
  onChangeSelectedUserIds,
  disabled = false,
  label = "Assign Staff Members",
  required = false,
  placeholder = "Select staff or leave blank for all",
  error,
  showSelectAll = false,
}: ComboboxMultiSelectUserProps<T>) {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <ComboboxMultiSelectUserInner
            selectedUserIds={(field.value as string[]) || []}
            onChangeSelectedUserIds={(val) => {
              field.onChange(val);
              if (onChangeSelectedUserIds) onChangeSelectedUserIds(val);
            }}
            disabled={disabled}
            label={label}
            required={required}
            placeholder={placeholder}
            error={fieldState.error?.message || (typeof error === "string" ? error : error?.message)}
            showSelectAll={showSelectAll}
          />
        )}
      />
    );
  }

  return (
    <ComboboxMultiSelectUserInner
      selectedUserIds={selectedUserIds}
      onChangeSelectedUserIds={onChangeSelectedUserIds || (() => {})}
      disabled={disabled}
      label={label}
      required={required}
      placeholder={placeholder}
      error={typeof error === "string" ? error : error?.message}
      showSelectAll={showSelectAll}
    />
  );
}
