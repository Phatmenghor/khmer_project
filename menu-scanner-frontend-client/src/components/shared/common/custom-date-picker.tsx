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
    } else {
      setSelectedDate(null);
    }
  }, [value, mode]);


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


  const formatDateForForm = (date: Date): string => {
    if (mode === "datetime") {
      return date.toISOString();
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (mode === "datetime" && selectedDate) {
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    }

    setSelectedDate(newDate);
  };


  const applyDateTime = () => {
    if (!selectedDate) return;

    if (mode === "datetime") {
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
    } else {
      onChange(formatDateForForm(selectedDate));
    }

    setIsOpen(false);
  };


  const handleMonthChange = (month: string) => {
    const monthIndex = MONTHS.indexOf(month as typeof MONTHS[number]);
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);
  };


  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), viewDate.getMonth(), 1);
    setViewDate(newDate);
  };


  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
  };


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


  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - YEAR_RANGE_OFFSET; i <= currentYear + YEAR_RANGE_OFFSET; i++) {
      years.push(i.toString());
    }
    return years;
  };


  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );


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
        <CustomButton
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-[36px] px-3.5 text-base md:text-sm rounded-[12px] transition-all duration-200 border border-border/80 bg-muted/30 shadow-2xs",
            !selectedDate && "text-muted-foreground/75",
            "hover:bg-muted/50 hover:border-border",
            "focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25",
            isOpen && "bg-background border-primary text-foreground ring-2 ring-primary/25",
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed bg-muted/20",
            className
          )}
          disabled={disabled}
        >
          {mode === "datetime" ? (
            <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/60" />
          ) : (
            <Calendar className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/60" />
          )}
          <span
            className={cn(
              "flex-1 truncate text-base md:text-sm",
              selectedDate ? "text-foreground" : "text-muted-foreground/75"
            )}
          >
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          {selectedDate && !disabled && (
            <div
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
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
        </CustomButton>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
          <div className="flex items-center gap-1">
            <CustomButton
              variant="ghost"
              size="unstyled"
              onClick={() => navigateMonth("prev")}
              className="h-7 w-7 p-0 hover:bg-accent rounded-md flex items-center justify-center"
              icon={<ChevronLeft className="h-4 w-4" />}
            />

            <div className="flex gap-1">
              <Select
                value={MONTHS[viewDate.getMonth()]}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-7 text-xs font-semibold px-2 border border-input rounded-md bg-background hover:bg-accent transition-colors flex items-center gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month} className="text-xs">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={viewDate.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-7 text-xs font-semibold px-2 border border-input rounded-md bg-background hover:bg-accent transition-colors flex items-center gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year} className="text-xs">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CustomButton
              variant="ghost"
              size="unstyled"
              onClick={() => navigateMonth("next")}
              className="h-7 w-7 p-0 hover:bg-accent rounded-md flex items-center justify-center"
              icon={<ChevronRight className="h-4 w-4" />}
            />
          </div>

          <CustomButton
            variant="ghost"
            size="unstyled"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 p-0 opacity-65 hover:opacity-100 hover:bg-accent rounded-full flex items-center justify-center"
            icon={<X className="h-4 w-4" />}
          />
        </div>

        {/* Days grid */}
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-1 justify-items-center">
            {DAYS.map((day, index) => (
              <div
                key={index}
                className="h-8 w-8 flex items-center justify-center text-xs font-bold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {calendarDays.map((dayObj, index) => (
              <CustomButton
                key={index}
                variant="ghost"
                size="unstyled"
                onClick={() => handleDateSelect(dayObj.day)}
                disabled={!dayObj.isCurrentMonth}
                className={cn(
                  "h-8 w-8 p-0 text-xs font-medium transition-all rounded-md flex items-center justify-center",
                  !dayObj.isCurrentMonth &&
                    "text-muted-foreground/30 hover:text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
                  dayObj.isSelected &&
                    "bg-primary text-primary-foreground font-bold hover:bg-primary/95",
                  dayObj.isToday &&
                    !dayObj.isSelected &&
                    "bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                )}
              >
                {dayObj.day}
              </CustomButton>
            ))}
          </div>
        </div>

        {/* DateTime selection mode */}
        {mode === "datetime" && (
          <div className="p-3 border-t bg-muted/5">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="h-8 w-14 text-xs font-semibold border-input bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour} className="font-medium text-xs">
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-xs font-bold text-muted-foreground">:</span>
              
              <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                <SelectTrigger className="h-8 w-14 text-xs font-semibold border-input bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute} className="font-medium text-xs">
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedPeriod}
                onValueChange={(val) => setSelectedPeriod(val as "AM" | "PM")}
              >
                <SelectTrigger className="h-8 w-14 text-xs font-semibold border-input bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM" className="font-medium text-xs">AM</SelectItem>
                  <SelectItem value="PM" className="font-medium text-xs">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="p-3 border-t bg-muted/20 flex gap-2">
          <CustomButton
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
            className="flex-1 h-8 text-xs font-semibold"
          >
            Now
          </CustomButton>

          <CustomButton
            variant="default"
            size="sm"
            onClick={applyDateTime}
            disabled={!selectedDate}
            className="flex-1 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Apply
          </CustomButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}
