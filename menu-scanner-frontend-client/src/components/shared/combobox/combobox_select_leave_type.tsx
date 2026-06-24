"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { fetchAllLeaveTypesService } from "@/features/hr/store/thunks/leave-type-thunks";

interface LeaveType {
  enumName: string;
  id: string;
}

interface ComboboxSelectLeaveTypeProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectLeaveType({
  value,
  onValueChange,
  disabled = false,
  label = "Leave Type",
  required = false,
  placeholder = "Select leave type...",
  error,
}: ComboboxSelectLeaveTypeProps) {
  const controller = useReduxCombobox<LeaveType>({
    cacheKey: "leaveTypes",
    thunkService: fetchAllLeaveTypesService,
  });

  const selectedType = controller.data.find((type) => type.enumName === value) || null;

  return (
    <AsyncCombobox<LeaveType>
      value={selectedType}
      onChange={(item) => onValueChange(item ? item.enumName : "")}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.enumName}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search leave type..."
      emptyMessage="No leave type found."
      error={error}
      disabled={disabled}
    />
  );
}
