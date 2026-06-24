"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { fetchAllWorkSchedulesTypeService } from "@/features/hr/store/thunks/work-schedule-type-thunks";

interface ScheduleType {
  enumName: string;
  id: string;
}

interface ComboboxSelectScheduleTypeProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectScheduleType({
  value,
  onValueChange,
  disabled = false,
  label = "Schedule Type",
  required = false,
  placeholder = "Select schedule type...",
  error,
}: ComboboxSelectScheduleTypeProps) {
  const controller = useReduxCombobox<ScheduleType>({
    cacheKey: "scheduleTypes",
    thunkService: fetchAllWorkSchedulesTypeService,
  });

  const selectedType = controller.data.find((type) => type.enumName === value) || null;

  return (
    <AsyncCombobox<ScheduleType>
      value={selectedType}
      onChange={(item) => onValueChange(item ? item.enumName : "")}
      controller={controller}
      getId={(item) => item.id}
      getLabel={(item) => item.enumName}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search schedule type..."
      emptyMessage="No schedule type found."
      error={error}
      disabled={disabled}
    />
  );
}
