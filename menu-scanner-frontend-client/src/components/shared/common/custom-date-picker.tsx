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
import { ChevronLeft, ChevronRight, X, Clock, Calendar } from "lucide-react";
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

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

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
  
  // Time states
  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

  // Sync with value prop
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setViewDate(date);
        
        if (mode === "datetime") {
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const period = hours >= 12 ? "PM" : "AM";
          const hour12 = hours % 12 || 12;
          
          setSelectedHour(String(hour12).padStart(2, "0"));
          setSelectedMinute(String(minutes).padStart(2, "0"));
          setSelectedPeriod(period);
        }
      } else {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value, mode]);

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    
    if (mode === "date") {
      onChange(formatDateForForm(newDate));
      setIsOpen(false);
    }
  };

  // Format date for form submission
  const formatDateForForm = (date: Date): string => {
    if (mode === "datetime") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      
      let hours = parseInt(selectedHour, 10);
      if (selectedPeriod === "PM" && hours < 12) hours += 12;
      if (selectedPeriod === "AM" && hours === 12) hours = 0;
      
      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = selectedMinute.padStart(2, "0");
      
      return `${year}-${month}-${day}T${formattedHours}:${formattedMinutes}:00`;
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  };

  // Apply date and time
  const applyDateTime = () => {
    if (selectedDate) {
      onChange(formatDateForForm(selectedDate));
      setIsOpen(false);
    }
  };

  // Clear selection
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange("");
  };

  // Navigation handlers
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
  };

  const handleMonthChange = (val: string) => {
    const monthIndex = MONTHS.indexOf(val as typeof MONTHS[number]);
    if (monthIndex !== -1) {
      const newDate = new Date(viewDate);
      newDate.setMonth(monthIndex);
      setViewDate(newDate);
    }
  };

  const handleYearChange = (val: string) => {
    const year = parseInt(val, 10);
    if (!isNaN(year)) {
      const newDate = new Date(viewDate);
      newDate.setFullYear(year);
      setViewDate(newDate);
    }
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
      });
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        selectedDate !== null &&
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      const isToday =
        today.getDate() === i &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({
        day: i,
        isCurrentMonth: true,
        isSelected,
        isToday,
      });
    }

    const remainingDays = DATE_RANGE_CALENDAR_DAYS - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
      });
    }

    return days;
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: YEAR_RANGE_OFFSET * 2 + 1 },
    (_, i) => (currentYear - YEAR_RANGE_OFFSET + i).toString()
  );

  const hours = Array.from({ length: 12 }, (_, i) => 
    String(i + 1).padStart(2, "0")
  );

  const minutes = Array.from({ length: 12 }, (_, i) => 
    String(i * 5).padStart(2, "0")
  );

  const formatDisplayText = () => {
    if (!selectedDate) return placeholder;

    const day = String(selectedDate.getDate()).padStart(2, "0");
    const monthFull = FULL_MONTHS[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    const formattedDate = `${day} ${monthFull} ${year}`;

    if (mode === "datetime") {
      return `${formattedDate}, ${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    }

    return formattedDate;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <CustomButton
          variant="outline"
          size="unstyled"
          id={id}
          disabled={disabled}
          className={cn(
            "w-full h-8 px-3 text-xs justify-between font-normal rounded-[8px] bg-muted/30 border-border/80 hover:bg-muted/50 focus:bg-background transition-all flex items-center gap-2.5",
            !selectedDate && "text-muted-foreground",
            error && "border-destructive focus-visible:border-destructive",
            className
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {mode === "datetime" ? (
              <Clock className="h-3.5 w-3.5 text-primary/80 shrink-0" />
            ) : (
              <Calendar className="h-3.5 w-3.5 text-primary/80 shrink-0" />
            )}
            <span className="truncate text-left text-xs font-medium">
              {formatDisplayText()}
            </span>
          </div>

          {selectedDate && !disabled && (
            <div
              role="button"
              tabIndex={0}
              className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 ml-1 cursor-pointer transition-colors"
              onClick={clearSelection}
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
      <PopoverContent
        className="w-[290px] sm:w-[310px] p-0 shadow-xl border border-border/80 rounded-xl z-[9999] bg-card overflow-hidden transition-all"
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        avoidCollisions={true}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1 flex-1">
            <CustomButton
              variant="ghost"
              size="unstyled"
              onClick={() => navigateMonth("prev")}
              className="h-7 w-7 p-0 hover:bg-accent rounded-md flex items-center justify-center shrink-0"
              icon={<ChevronLeft className="h-4 w-4" />}
            />

            <div className="flex items-center gap-1 flex-1 min-w-0">
              {/* Shadcn Custom Select for Month */}
              <Select
                value={MONTHS[viewDate.getMonth()]}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-7 text-xs font-bold px-2 py-0 min-w-[95px] flex-1 rounded-md border border-border/80 bg-background text-foreground shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-56">
                  {MONTHS.map((m, idx) => (
                    <SelectItem key={m} value={m} className="text-xs font-semibold">
                      {FULL_MONTHS[idx]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Shadcn Custom Select for Year */}
              <Select
                value={viewDate.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-7 text-xs font-bold px-2 py-0 min-w-[75px] w-[75px] rounded-md border border-border/80 bg-background text-foreground shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-56">
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y} className="text-xs font-semibold">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CustomButton
              variant="ghost"
              size="unstyled"
              onClick={() => navigateMonth("next")}
              className="h-7 w-7 p-0 hover:bg-accent rounded-md flex items-center justify-center shrink-0"
              icon={<ChevronRight className="h-4 w-4" />}
            />
          </div>

          <CustomButton
            variant="ghost"
            size="unstyled"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 p-0 hover:bg-accent rounded-md flex items-center justify-center shrink-0 ml-1"
            icon={<X className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* Calendar Grid */}
        <div className="p-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS.map((day, idx) => (
              <div
                key={`${day}-${idx}`}
                className="text-[10px] font-bold text-muted-foreground/70 h-6 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((dayObj, index) => (
              <CustomButton
                key={index}
                variant="ghost"
                size="unstyled"
                onClick={() => handleDateSelect(dayObj.day)}
                disabled={!dayObj.isCurrentMonth}
                className={cn(
                  "h-7 w-7 p-0 text-xs font-medium transition-all rounded-md flex items-center justify-center",
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
          <div className="p-2 border-t border-border bg-muted/10">
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="h-7 px-2 py-0 text-xs font-bold w-[60px] rounded-md border border-border/80 bg-background text-foreground shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-48">
                  {hours.map((h) => (
                    <SelectItem key={h} value={h} className="text-xs font-semibold">
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-xs font-bold text-muted-foreground">:</span>
              
              <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                <SelectTrigger className="h-7 px-2 py-0 text-xs font-bold w-[60px] rounded-md border border-border/80 bg-background text-foreground shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-48">
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs font-semibold">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPeriod} onValueChange={(val) => setSelectedPeriod(val as "AM" | "PM")}>
                <SelectTrigger className="h-7 px-2 py-0 text-xs font-bold w-[65px] rounded-md border border-border/80 bg-background text-foreground shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="AM" className="text-xs font-semibold">AM</SelectItem>
                  <SelectItem value="PM" className="text-xs font-semibold">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="p-2 border-t border-border bg-muted/20 flex gap-2">
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
            className="flex-1 h-7 text-xs font-semibold"
          >
            Now
          </CustomButton>

          <CustomButton
            variant="primary"
            size="sm"
            onClick={applyDateTime}
            disabled={!selectedDate}
            className="flex-1 h-7 text-xs font-bold"
          >
            Apply
          </CustomButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}
