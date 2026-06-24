"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { fetchAllUsersService } from "@/features/auth/store/thunks/users-thunks";

interface ComboboxSelectUserProps {
  dataSelect: UserResponseModel | null;
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
      getId={(item) => item.id}
      getLabel={(item) => item.fullName}
      renderItem={(item) => (
        <div className="flex items-center justify-between w-full text-xs">
          <span>
            {item.fullName}
            {item.roles && item.roles.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({item.roles.join(", ")})
              </span>
            )}
          </span>
        </div>
      )}
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
