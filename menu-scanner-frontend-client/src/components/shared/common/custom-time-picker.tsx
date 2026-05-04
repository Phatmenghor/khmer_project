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

  // Initialize time from value prop (HH:mm or HH:mm:ss format)
  useEffect(() => {
    if (value) {
      const timeParts = value.split(":");
      if (timeParts.length >= 2) {
        const hour24 = parseInt(timeParts[0]);
        const minute = timeParts[1];

        // Convert to 12-hour format
        const period = hour24 >= 12 ? "PM" : "AM";
        const hour12 = hour24 % 12 || 12;

        setSelectedHour(String(hour12).padStart(2, "0"));
        setSelectedMinute(minute.padStart(2, "0"));
        setSelectedPeriod(period as "AM" | "PM");
      }
    }
  }, [value]);

  // Convert 12-hour + AM/PM to 24-hour format
  const convertTo24Hour = (hour12: string, period: "AM" | "PM"): string => {
    let hour24 = parseInt(hour12);
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    return String(hour24).padStart(2, "0");
  };

  // Format time for display
  const formatTimeDisplay = (hour: string, minute: string, period: "AM" | "PM"): string => {
    return `${hour}:${minute} ${period}`;
  };

  // Format time for form submission (HH:mm in 24-hour)
  const formatTimeForForm = (): string => {
    const hour24 = convertTo24Hour(selectedHour, selectedPeriod);
    return `${hour24}:${selectedMinute}`;
  };

  // Handle apply time
  const applyTime = () => {
    const formattedTime = formatTimeForForm();
    onChange(formattedTime);
    setIsOpen(false);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedHour("09");
    setSelectedMinute("00");
    setSelectedPeriod("AM");
    onChange("");
  };

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // Generate minute options (00-59)
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
            "relative w-full h-10 rounded-md border border-input bg-background",
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
              "w-full h-full px-3 text-sm font-normal text-left flex items-center gap-2",
              "rounded-md transition-colors",
              !disabled && "hover:bg-primary/10 hover:border-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => setIsOpen(true)}
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{displayValue || placeholder}</span>
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
      <PopoverContent className="w-96 p-0" align="start">
        {/* Header */}
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <span className="text-sm font-medium">Select Time</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-accent rounded transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Time Picker */}
        <div className="p-4 space-y-4">
          {/* Hour and Minute Selectors */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Hour</label>
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="h-10 w-20 text-sm border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-2xl font-bold mt-6">:</div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Minute</label>
              <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                <SelectTrigger className="h-10 w-20 text-sm border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Period</label>
              <div className="flex gap-2 border rounded-md p-1 bg-muted">
                {["AM", "PM"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period as "AM" | "PM")}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                      selectedPeriod === period
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg text-center">
            <span className="text-xs text-muted-foreground">Selected Time: </span>
            <div className="text-lg font-bold text-primary">
              {formatTimeDisplay(selectedHour, selectedMinute, selectedPeriod)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 flex gap-2">
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
            className="flex-1 h-8 text-xs"
          >
            Now
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={applyTime}
            className="flex-1 h-8 text-xs"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
