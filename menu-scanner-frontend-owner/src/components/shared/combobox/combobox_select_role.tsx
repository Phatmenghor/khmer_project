"use client";

import { useMemo } from "react";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { RoleResponseModel } from "@/features/auth/store/models/response/role-response";
import { fetchAllRoleService } from "@/features/auth/store/thunks/role-thunks";
import { AppDefault } from "@/constants/app-resource/default/default";
import { formatEnumValue } from "@/utils/format/enum-formatter";

interface ComboboxSelectRoleProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  defaultUserType?: string;
  size?: "sm" | "md" | "lg";
}

export function ComboboxSelectRole({
  value,
  onValueChange,
  disabled = false,
  label = "User Role",
  required = false,
  placeholder = "Select user role",
  error,
  defaultUserType,
  size = "md",
}: ComboboxSelectRoleProps) {
  const controller = useReduxCombobox<RoleResponseModel>({
    cacheKey: `roles-${defaultUserType || "all"}`,
    thunkService: fetchAllRoleService,
    extraParams: {
      includeAll: true,
      userTypes: defaultUserType ? [defaultUserType] : ["PLATFORM_USER"],
    },
  });

  const activeRoles = useMemo(() => {
    return controller.data.filter((role) => role.name !== "BUSINESS_OWNER");
  }, [controller.data]);

  const selectedRole = useMemo(() => {
    return activeRoles.find((role) => role.name === value) || null;
  }, [activeRoles, value]);

  const modifiedController = {
    ...controller,
    data: activeRoles,
  };

  return (
    <AsyncCombobox<RoleResponseModel>
      value={selectedRole}
      onChange={(item) => onValueChange(item ? item.name : "")}
      controller={modifiedController}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => (!item ? "" : formatEnumValue(item.name))}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search role..."
      emptyMessage="No role found."
      error={error}
      disabled={disabled}
      size={size}
    />
  );
}
