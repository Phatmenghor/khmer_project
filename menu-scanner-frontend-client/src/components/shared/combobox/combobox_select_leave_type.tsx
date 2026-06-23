"use client";

import { useEffect, useState } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
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
import { useAppDispatch } from "@/store";
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
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);


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


  const filteredLeaveTypes = leaveTypes.filter((type) =>
    type.enumName.toLowerCase().includes(searchTerm.toLowerCase()),
  );


  const selectedLeaveType = leaveTypes.find(
    (type) => type.enumName === value,
  );


  const displayValue = selectedLeaveType
    ? selectedLeaveType.enumName
    : value || placeholder;

  return (
    <div className="space-y-1 w-full">
      {label && (
        <Label className="text-xs font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <CustomButton
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-7 text-xs transition-all duration-200 border-input",
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
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </CustomButton>
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
            <CommandList className="max-h-44 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="animate-spin text-gray-500 h-3 w-3 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">
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
                        className="h-7 text-xs"
                      >
                        <Check
                          className={cn(
                            "mr-1 h-3 w-3",
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
