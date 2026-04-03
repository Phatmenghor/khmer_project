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
import { fetchAllLeaveTypesService } from "@/redux/features/hr/store/thunks/leave-type-thunks";

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
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch leave types when combobox opens
  useEffect(() => {
    if (!open || leaveTypes.length > 0) return;

    const fetchLeaveTypes = async () => {
      setLoading(true);
      try {
        const result = await dispatch(
          fetchAllLeaveTypesService({ search: "", pageNo: 1 }),
        ).unwrap();

        if (result?.content) {
          setLeaveTypes(result.content);
        }
      } catch (error) {
        console.error("Error fetching leave types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
  };

  // Filter leave types based on search term
  const filteredLeaveTypes = leaveTypes.filter((type) =>
    type.enumName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Find the selected leave type to display
  const selectedLeaveType = leaveTypes.find(
    (type) => type.enumName === value,
  );

  // Display value even before data loads (for edit mode)
  const displayValue = selectedLeaveType
    ? selectedLeaveType.enumName
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
              "w-full justify-between h-9 text-sm",
              !value && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500",
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
              placeholder="Search leave type..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading leave types...
                  </p>
                </div>
              ) : (
                <>
                  <CommandEmpty>No leave type found.</CommandEmpty>
                  <CommandGroup>
                    {filteredLeaveTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        value={type.enumName}
                        onSelect={() => handleSelect(type.enumName)}
                        className="h-9 text-sm"
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
