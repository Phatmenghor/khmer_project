"use client";

import React, { useState, useEffect } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
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
            "relative w-full h-[32px] rounded-md border border-input bg-background",
            "transition-all duration-200",
            isOpen && "bg-primary/20 border-primary",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed bg-muted"
          )}
        >
          <CustomButton variant="unstyled" size="unstyled"
            type="button"
            disabled={disabled}
            className={cn(
              "w-full h-full px-3 text-base md:text-sm font-normal text-left flex items-center gap-2",
              "rounded-md transition-colors min-w-0",
              !disabled && "hover:bg-primary/10 hover:border-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => setIsOpen(true)}
            title={displayValue || placeholder}
          >
            <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
            <span
              className={cn(
                "flex-1 truncate line-clamp-1 text-base md:text-sm",
                value ? "text-foreground" : "text-muted-foreground/75"
              )}
            >
              {displayValue || placeholder}
            </span>
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
          </CustomButton>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start" side="bottom" sideOffset={8}>
        {/* Header */}
        <div className="px-3 py-2 border-b bg-muted/20 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Select Time</span>
          <CustomButton variant="unstyled" size="unstyled"
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
            title="Close"
          >
            <X className="h-3 w-3" />
          </CustomButton>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Pickers container */}
          <div className="flex items-center justify-center gap-2 py-1">
            {/* Hour Selector */}
            <div className="flex flex-col gap-1 w-[60px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase text-center tracking-wider">Hour</span>
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="h-[36px] w-full text-base md:text-sm font-semibold border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour} className="text-center font-medium">
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Separator */}
            <div className="text-base font-bold text-muted-foreground mt-4">:</div>

            {/* Minute Selector */}
            <div className="flex flex-col gap-1 w-[60px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase text-center tracking-wider">Min</span>
              <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                <SelectTrigger className="h-[36px] w-full text-base md:text-sm font-semibold border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute} className="text-center font-medium">
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period Selector */}
            <div className="flex flex-col gap-1 w-[80px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase text-center tracking-wider">Period</span>
              <div className="flex border rounded-md p-0.5 bg-muted h-[36px] items-center border-input">
                {["AM", "PM"].map((period) => (
                  <CustomButton variant="unstyled" size="unstyled"
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period as "AM" | "PM")}
                    className={cn(
                      "flex-1 h-full text-xs font-bold rounded transition-all flex items-center justify-center",
                      selectedPeriod === period
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period}
                  </CustomButton>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Time Display */}
          <div className="py-2 px-3 bg-primary/5 border border-primary/10 rounded-md text-center space-y-0.5">
            <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">Selected Time</span>
            <div className="text-base font-bold text-primary">
              {formatTimeDisplay(selectedHour, selectedMinute, selectedPeriod)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t bg-muted/20 flex gap-2">
          <CustomButton
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
            className="flex-1 h-8 text-xs font-semibold"
          >
            Now
          </CustomButton>
          <CustomButton
            variant="default"
            size="sm"
            onClick={applyTime}
            className="flex-1 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Apply
          </CustomButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}
