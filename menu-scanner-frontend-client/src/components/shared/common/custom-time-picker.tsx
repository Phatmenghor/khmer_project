"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomTimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function CustomTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select time",
  className,
  error = false,
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string>("09");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");


  useEffect(() => {
    if (value) {
      const timeParts = value.split(":");
      if (timeParts.length >= 2) {
        const hour24 = parseInt(timeParts[0]);
        const minute = timeParts[1];


        const period = hour24 >= 12 ? "PM" : "AM";
        const hour12 = hour24 % 12 || 12;

        setSelectedHour(String(hour12).padStart(2, "0"));
        setSelectedMinute(minute.padStart(2, "0"));
        setSelectedPeriod(period as "AM" | "PM");
      }
    }
  }, [value]);


  const convertTo24Hour = (hour12: string, period: "AM" | "PM"): string => {
    let hour24 = parseInt(hour12);
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    return String(hour24).padStart(2, "0");
  };


  const formatTimeDisplay = (hour: string, minute: string, period: "AM" | "PM"): string => {
    return `${hour}:${minute} ${period}`;
  };


  const formatTimeForForm = (): string => {
    const hour24 = convertTo24Hour(selectedHour, selectedPeriod);
    return `${hour24}:${selectedMinute}`;
  };


  const applyTime = () => {
    const formattedTime = formatTimeForForm();
    onChange(formattedTime);
    setIsOpen(false);
  };


  const clearSelection = () => {
    setSelectedHour("09");
    setSelectedMinute("00");
    setSelectedPeriod("AM");
    onChange("");
  };


  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );


  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const displayValue = value
    ? formatTimeDisplay(selectedHour, selectedMinute, selectedPeriod)
    : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative w-full h-10 md:h-9 rounded-md border border-input bg-background",
            "transition-all duration-200",
            !value && "text-muted-foreground",
            isOpen && "bg-primary/20 border-primary",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed bg-muted"
          )}
        >
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full h-full px-3 text-base md:text-sm font-normal text-left flex items-center gap-2",
              "rounded-md transition-colors min-w-0",
              !disabled && "hover:bg-primary/10 hover:border-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => setIsOpen(true)}
            title={displayValue || placeholder}
          >
            <Clock className="h-4 w-4 flex-shrink-0 opacity-50" />
            <span className="flex-1 truncate line-clamp-1">{displayValue || placeholder}</span>
            {value && !disabled && (
              <div
                className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                role="button"
                tabIndex={0}
              >
                <X className="h-3 w-3 text-destructive" />
              </div>
            )}
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[95vw] xs:w-64 sm:w-full md:w-[500px] p-0 max-w-[95vw] sm:max-w-2xl" align="start" side="bottom" sideOffset={8}>
        {}
        <div className="p-1 sm:p-2 border-b bg-muted/30 flex items-center justify-between sticky top-0 z-10 gap-1">
          <span className="text-xs sm:text-xs font-semibold truncate line-clamp-1">Select Time</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-5 w-5 flex-shrink-0 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-accent rounded transition-colors"
            title="Close"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {}
        <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
          {}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-1 xs:gap-1 sm:gap-1">
            {/* Hour Selector */}
            <div className="flex flex-col gap-1 flex-1 xs:flex-none xs:min-w-11 min-w-0">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate line-clamp-1">Hour</label>
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="h-10 md:h-9 w-full xs:w-16 text-base md:text-sm font-medium border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-32 min-w-8">
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour} className="text-center">
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Separator */}
            <div className="text-sm font-bold text-muted-foreground xs:mt-4 flex-shrink-0">:</div>

            {/* Minute Selector */}
            <div className="flex flex-col gap-1 flex-1 xs:flex-none xs:min-w-16 min-w-0">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate line-clamp-1">Min</label>
              <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                <SelectTrigger className="h-10 md:h-9 w-full xs:w-16 text-base md:text-sm font-medium border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-32 min-w-8">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute} className="text-center">
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period Selector */}
            <div className="flex flex-col gap-1 flex-1 xs:flex-none xs:min-w-14 min-w-0">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate line-clamp-1">Period</label>
              <div className="flex gap-1 border rounded-md p-1 bg-muted h-10 md:h-9 items-center">
                {["AM", "PM"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period as "AM" | "PM")}
                    className={cn(
                      "flex-1 h-full px-2 text-base md:text-sm font-semibold rounded-sm transition-all truncate flex items-center justify-center",
                      selectedPeriod === period
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded text-center space-y-1">
            <span className="text-xs text-muted-foreground block uppercase tracking-wide font-semibold truncate line-clamp-1">Selected Time</span>
            <div className="text-xs sm:text-sm font-bold text-primary truncate line-clamp-1">
              {formatTimeDisplay(selectedHour, selectedMinute, selectedPeriod)}
            </div>
          </div>
        </div>

        {}
        <div className="p-1 sm:p-2 border-t bg-muted/30 flex gap-1 sticky bottom-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              let hour = now.getHours();
              const minute = String(now.getMinutes()).padStart(2, "0");

              const period = hour >= 12 ? "PM" : "AM";
              const hour12 = hour % 12 || 12;

              setSelectedHour(String(hour12).padStart(2, "0"));
              setSelectedMinute(minute);
              setSelectedPeriod(period as "AM" | "PM");
              onChange(formatTimeForForm());
              setIsOpen(false);
            }}
            className="flex-1 h-6 text-xs sm:text-xs font-medium truncate line-clamp-1"
          >
            Now
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={applyTime}
            className="flex-1 h-6 text-xs sm:text-xs font-medium truncate line-clamp-1"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
