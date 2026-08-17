"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { fetchAllUsersService } from "@/features/auth/store/thunks/users-thunks";
import { formatEnumValue } from "@/utils/format/enum-formatter";

interface ComboboxSelectUserProps {
  dataSelect?: UserResponseModel | null;
  onChangeSelected: (item: UserResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectUser({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "User",
  required = false,
  size = "md",
  placeholder = "Select a user...",
  error,
}: ComboboxSelectUserProps) {
  const controller = useReduxCombobox<UserResponseModel>({
    cacheKey: "users",
    thunkService: fetchAllUsersService,
  });

  return (
    <AsyncCombobox<UserResponseModel>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => item?.fullName || `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "Staff Member"}
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
      size={size}
    />
  );
}
