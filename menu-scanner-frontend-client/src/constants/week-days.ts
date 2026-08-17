export type DayOfWeekType = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface WeekDayItem {
  day: DayOfWeekType;
  label: string;
  short: string;
}

export const BASE_WEEK_DAYS: WeekDayItem[] = [
  { day: "MONDAY", label: "Monday", short: "Mon" },
  { day: "TUESDAY", label: "Tuesday", short: "Tue" },
  { day: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { day: "THURSDAY", label: "Thursday", short: "Thu" },
  { day: "FRIDAY", label: "Friday", short: "Fri" },
  { day: "SATURDAY", label: "Saturday", short: "Sat" },
  { day: "SUNDAY", label: "Sunday", short: "Sun" },
];

export const EMPTY_WORK_SHIFT_ROSTER = BASE_WEEK_DAYS.map((d) => ({
  dayOfWeek: d.day,
  enabled: false,
  startTime: "",
  endTime: "",
  breakStartTime: "",
  breakEndTime: "",
  enableCheckIn: false,
  scanMode: "FULL_TIME",
}));
