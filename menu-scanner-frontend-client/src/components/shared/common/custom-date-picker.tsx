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
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATE_RANGE_CALENDAR_DAYS, YEAR_RANGE_OFFSET } from "@/constants/form-options";

interface DateTimePickerProps {
  value?: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
  mode?: "date" | "datetime";
  id?: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const DAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function CustomDateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  className,
  error = false,
  mode = "date",
  id,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");

  // Initialize selected date and time from value prop
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setViewDate(date);

        if (mode === "datetime") {
          const hours = date.getHours();
          const minutes = date.getMinutes();

          setSelectedPeriod(hours >= 12 ? "PM" : "AM");
          setSelectedHour(String(hours % 12 || 12).padStart(2, "0"));
          setSelectedMinute(String(minutes).padStart(2, "0"));
        }
      }
    }
  }, [value, mode]);

  // Format date for display
  const formatDate = (date: Date): string => {
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (mode === "datetime") {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      return `${dateStr}, ${displayHour}:${String(minutes).padStart(
        2,
        "0"
      )} ${period}`;
    }

    return dateStr;
  };

  // Format date for form submission - use ISO 8601 format for consistency
  const formatDateForForm = (date: Date): string => {
    if (mode === "datetime") {
      return date.toISOString();
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (mode === "datetime" && selectedDate) {
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    }

    setSelectedDate(newDate);

    if (mode === "date") {
      onChange(formatDateForForm(newDate));
      setIsOpen(false);
    }
  };

  // Handle time change
  const handleTimeChange = () => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    let hours = parseInt(selectedHour);

    if (selectedPeriod === "PM" && hours !== 12) {
      hours += 12;
    } else if (selectedPeriod === "AM" && hours === 12) {
      hours = 0;
    }

    newDate.setHours(hours);
    newDate.setMinutes(parseInt(selectedMinute));

    setSelectedDate(newDate);
    onChange(formatDateForForm(newDate));
  };

  // Apply datetime selection
  const applyDateTime = () => {
    if (selectedDate && mode === "datetime") {
      handleTimeChange();
      setIsOpen(false);
    }
  };

  // Handle month change
  const handleMonthChange = (month: string) => {
    const monthIndex = MONTHS.indexOf(month);
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), viewDate.getMonth(), 1);
    setViewDate(newDate);
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < DATE_RANGE_CALENDAR_DAYS; i++) {
      const dayObj = {
        date: new Date(currentDate),
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isSelected: selectedDate
          ? currentDate.toDateString() === selectedDate.toDateString()
          : false,
        isToday: currentDate.toDateString() === new Date().toDateString(),
      };
      days.push(dayObj);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Generate year options
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - YEAR_RANGE_OFFSET; i <= currentYear + YEAR_RANGE_OFFSET; i++) {
      years.push(i.toString());
    }
    return years;
  };

  // Generate hour/minute options
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  // Clear selection
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedDate(null);
    onChange("");
  };

  const calendarDays = generateCalendarDays();
  const yearOptions = generateYearOptions();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 text-sm",
            !selectedDate && "text-muted-foreground",
            error && "border-red-500 focus:border-red-500",
            !error && "focus:border-green-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          {mode === "datetime" ? (
            <Clock className="mr-2 h-4 w-4" />
          ) : (
            <Calendar className="mr-2 h-4 w-4" />
          )}
          <span className="flex-1">
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          {selectedDate && !disabled && (
            <div
              className="ml-1 h-6 w-6 p-0 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
              onClick={clearSelection}
              role="button"
              tabIndex={0}
              aria-label="Clear date selection"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  clearSelection(e as any);
                }
              }}
            >
              <X className="h-3 w-3" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-6 w-6 p-0 hover:bg-accent"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex gap-1">
              <Select
                value={MONTHS[viewDate.getMonth()]}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-8 text-sm w-auto min-w-[60px] border-0 bg-transparent hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={viewDate.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 text-sm w-auto min-w-[65px] border-0 bg-transparent hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-6 w-6 p-0 hover:bg-accent"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 opacity-50 hover:opacity-100 hover:bg-accent"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day, index) => (
              <div
                key={index}
                className="h-8 w-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayObj, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleDateSelect(dayObj.day)}
                disabled={!dayObj.isCurrentMonth}
                className={cn(
                  "h-8 w-8 p-0 text-xs font-normal transition-all hover:bg-accent hover:text-accent-foreground",
                  !dayObj.isCurrentMonth &&
                    "text-muted-foreground/30 hover:text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
                  dayObj.isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
                  dayObj.isToday &&
                    !dayObj.isSelected &&
                    "bg-accent text-accent-foreground font-semibold ring-1 ring-border"
                )}
              >
                {dayObj.day}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Picker (only for datetime mode) */}
        {mode === "datetime" && (
          <div className="p-3 border-t">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="h-9 w-16 text-sm">
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
                <SelectTrigger className="h-9 w-16 text-sm">
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
              <Select
                value={selectedPeriod}
                onValueChange={(val) => setSelectedPeriod(val as "AM" | "PM")}
              >
                <SelectTrigger className="h-9 w-16 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setSelectedDate(today);
              setViewDate(today);

              if (mode === "datetime") {
                const hours = today.getHours();
                const minutes = today.getMinutes();
                setSelectedPeriod(hours >= 12 ? "PM" : "AM");
                setSelectedHour(String(hours % 12 || 12).padStart(2, "0"));
                setSelectedMinute(String(minutes).padStart(2, "0"));
              }

              onChange(formatDateForForm(today));
              setIsOpen(false);
            }}
            className="flex-1 h-8 text-xs hover:bg-accent"
          >
            Now
          </Button>

          {mode === "datetime" && (
            <Button
              variant="default"
              size="sm"
              onClick={applyDateTime}
              disabled={!selectedDate}
              className="flex-1 h-8 text-xs"
            >
              Apply
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
