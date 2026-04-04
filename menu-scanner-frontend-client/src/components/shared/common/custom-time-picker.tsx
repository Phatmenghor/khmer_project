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

  // Initialize time from value prop (HH:mm or HH:mm:ss format)
  useEffect(() => {
    if (value) {
      const timeParts = value.split(":");
      if (timeParts.length >= 2) {
        setSelectedHour(timeParts[0].padStart(2, "0"));
        setSelectedMinute(timeParts[1].padStart(2, "0"));
      }
    }
  }, [value]);

  // Format time for display (HH:mm AM/PM)
  const formatTimeDisplay = (hour: string, minute: string): string => {
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${String(displayHour).padStart(2, "0")}:${minute} ${period}`;
  };

  // Format time for form submission (HH:mm)
  const formatTimeForForm = (hour: string, minute: string): string => {
    return `${hour}:${minute}`;
  };

  // Handle apply time
  const applyTime = () => {
    const formattedTime = formatTimeForForm(selectedHour, selectedMinute);
    onChange(formattedTime);
    setIsOpen(false);
  };

  // Clear selection
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedHour("09");
    setSelectedMinute("00");
    onChange("");
  };

  // Generate hour options (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  // Generate minute options (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const displayValue = value
    ? formatTimeDisplay(selectedHour, selectedMinute)
    : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 text-sm transition-all duration-200 border-input",
            !value && "text-muted-foreground",
            // Hover state
            "hover:bg-primary/10 hover:border-primary hover:text-primary",
            // Focus state
            "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
            // Active/Open state
            isOpen && "bg-primary/20 border-primary text-primary",
            // Error state
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          <span className="flex-1">{displayValue || placeholder}</span>
          {value && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={clearSelection}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        {/* Header */}
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Select Time</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 opacity-50 hover:opacity-100 hover:bg-accent"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Time Picker */}
        <div className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger className="h-10 w-20 text-sm border-input hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-lg font-medium">:</span>
            <Select value={selectedMinute} onValueChange={setSelectedMinute}>
              <SelectTrigger className="h-10 w-20 text-sm border-input hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="mt-3 text-center">
            <span className="text-xs text-muted-foreground">Preview: </span>
            <span className="text-sm font-medium">
              {formatTimeDisplay(selectedHour, selectedMinute)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              const currentHour = String(now.getHours()).padStart(2, "0");
              const currentMinute = String(now.getMinutes()).padStart(2, "0");
              setSelectedHour(currentHour);
              setSelectedMinute(currentMinute);
              onChange(formatTimeForForm(currentHour, currentMinute));
              setIsOpen(false);
            }}
            className="flex-1 h-8 text-xs hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
          >
            Now
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={applyTime}
            className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
