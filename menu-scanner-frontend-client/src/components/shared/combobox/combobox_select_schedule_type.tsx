"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { fetchAllWorkSchedulesTypeService } from "@/redux/features/hr/store/thunks/work-schedule-type-thunks";

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
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch schedule types when combobox opens
  useEffect(() => {
    if (!open || scheduleTypes.length > 0) return;

    const fetchScheduleTypes = async () => {
      setLoading(true);
      try {
        const result = await dispatch(
          fetchAllWorkSchedulesTypeService({ search: "", pageNo: 1 }),
        ).unwrap();

        if (result?.content) {
          setScheduleTypes(result.content);
        }
      } catch (error) {
        console.error("Error fetching schedule types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
  };

  // Filter schedule types based on search term
  const filteredScheduleTypes = scheduleTypes.filter((type) =>
    type.enumName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Find the selected schedule type to display
  const selectedScheduleType = scheduleTypes.find(
    (type) => type.enumName === value,
  );

  // FIX: Display value even before data loads (for edit mode)
  const displayValue = selectedScheduleType
    ? selectedScheduleType.enumName
    : value || placeholder;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 text-sm transition-all duration-200 border-input",
              !value && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              open && "bg-primary/20 border-primary text-primary",
              error && "border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            {displayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border-border"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search schedule type..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading schedule types...
                  </p>
                </div>
              ) : (
                <>
                  <CommandEmpty>No schedule type found.</CommandEmpty>
                  <CommandGroup>
                    {filteredScheduleTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        value={type.enumName}
                        onSelect={() => handleSelect(type.enumName)}
                        className="h-10 text-sm"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === type.enumName
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {type.enumName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
