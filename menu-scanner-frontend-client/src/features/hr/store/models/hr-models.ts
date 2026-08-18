import { formatEnumValue } from "@/utils/format/enum-formatter";

export interface UserBasicInfo {
  id: string;
  userIdentifier?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  roles?: string[];
  profileImage?: {
    sm?: string;
    md?: string;
    lg?: string;
    o?: string;
  };
  profileImageUrl?: string;
  [key: string]: unknown;
}

export function getUserDisplayName(user?: UserBasicInfo | null): string {
  if (!user) return "General Shift (All Staff)";
  if (user.fullName && user.fullName.trim()) return user.fullName.trim();
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (name) return name;
  if (user.userIdentifier) return String(user.userIdentifier);
  if (user.email) return String(user.email);
  if (user.phoneNumber) return String(user.phoneNumber);
  return "Staff Member";
}

export function getUserIdentifierDisplay(user?: UserBasicInfo | null): string {
  if (!user) return "";
  if (user.userIdentifier) return user.userIdentifier;
  if (user.email) return String(user.email);
  if (user.phoneNumber) return String(user.phoneNumber);
  return "";
}

export function getUserRolesDisplay(user?: UserBasicInfo | null): string {
  if (!user) return "General Shift (All Staff)";
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles.map((r: string) => formatEnumValue(r)).join(", ");
  }
  if (user.position && typeof user.position === "string") {
    return formatEnumValue(user.position);
  }
  if (user.email) return String(user.email);
  return "Staff Member";
}

export function getUserAvatarUrl(user?: UserBasicInfo | null): string | undefined {
  if (!user) return undefined;
  if (user.profileImage && typeof user.profileImage === "object") {
    return user.profileImage.sm || user.profileImage.md || user.profileImage.o || user.profileImage.lg;
  }
  if (typeof user.profileImage === "string") return user.profileImage;
  return user.profileImageUrl;
}

export interface DayShiftDto {
  dayOfWeek: string;
  enabled: boolean;
  startTime?: string;
  endTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  enableCheckIn?: boolean;
  scanMode?: string;
}

export interface WorkingDaysFormattedInfo {
  summaryLabel: string;
  isFullWeek: boolean;
  isMonToFri: boolean;
  isMonToSat: boolean;
  days: {
    day: string;
    short: string;
    label: string;
    isWorking: boolean;
  }[];
}

import { BASE_WEEK_DAYS } from "@/constants/week-days";

export function getWorkingDaysFormattedInfo(
  workDays: string[] = [],
  dayShifts?: DayShiftDto[]
): WorkingDaysFormattedInfo {
  let activeDaysList: string[] = [];

  if (dayShifts && dayShifts.length > 0) {
    activeDaysList = dayShifts.filter((ds) => ds.enabled).map((ds) => ds.dayOfWeek);
  } else {
    activeDaysList = workDays || [];
  }

  const daysSet = new Set(activeDaysList.map((d) => d.toUpperCase()));

  const hasMon = daysSet.has("MONDAY");
  const hasTue = daysSet.has("TUESDAY");
  const hasWed = daysSet.has("WEDNESDAY");
  const hasThu = daysSet.has("THURSDAY");
  const hasFri = daysSet.has("FRIDAY");
  const hasSat = daysSet.has("SATURDAY");
  const hasSun = daysSet.has("SUNDAY");

  const isMonToFri = hasMon && hasTue && hasWed && hasThu && hasFri && !hasSat && !hasSun;
  const isMonToSat = hasMon && hasTue && hasWed && hasThu && hasFri && hasSat && !hasSun;
  const isFullWeek = hasMon && hasTue && hasWed && hasThu && hasFri && hasSat && hasSun;

  let summaryLabel = "";
  if (isFullWeek) {
    summaryLabel = "Monday - Sunday";
  } else if (isMonToSat) {
    summaryLabel = "Monday - Saturday";
  } else if (isMonToFri) {
    summaryLabel = "Monday - Friday";
  } else {
    summaryLabel = BASE_WEEK_DAYS.filter((d) => daysSet.has(d.day)).map((d) => d.short).join(", ");
  }

  const days = BASE_WEEK_DAYS.map((d) => ({
    day: d.day,
    short: d.short,
    label: d.label,
    isWorking: daysSet.has(d.day),
  }));

  return {
    summaryLabel,
    isFullWeek,
    isMonToFri,
    isMonToSat,
    days,
  };
}

export type AttendanceStatusType = "PRESENT" | "LATE" | "ABSENT" | "HALF_DAY" | "LEAVE";

export interface AttendanceCheckIn {
  id: string;
  checkInTime: string;
  checkInType: "CHECK_IN" | "CHECK_OUT";
  latitude?: number;
  longitude?: number;
  remarks?: string;
}

export interface AttendanceModel {
  id: string;
  userInfo?: UserBasicInfo;
  businessId: string;
  workScheduleId?: string;
  attendanceDate: string;
  checkIns?: AttendanceCheckIn[];
  status: AttendanceStatusType;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type LeaveStatusType = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type LeaveTypeEnum = "ANNUAL" | "SICK" | "UNPAID" | "MATERNITY" | "SPECIAL";

export interface LeaveModel {
  id: string;
  referenceNumber?: string;
  userInfo?: UserBasicInfo;
  businessId: string;
  leaveTypeEnum: LeaveTypeEnum | string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentImage?: string;
  status: LeaveStatusType;
  actionBy?: string;
  actionUserInfo?: UserBasicInfo;
  actionAt?: string;
  actionNote?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface WorkScheduleModel {
  id: string;
  userInfo?: UserBasicInfo;
  businessId: string;
  name: string;
  workDays?: string[];
  startTime?: string;
  endTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  dayShifts?: DayShiftDto[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AttendanceFilterPayload {
  businessId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatusType;
  search?: string;
  searchQuery?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface LeaveFilterPayload {
  businessId?: string;
  userId?: string;
  status?: LeaveStatusType;
  leaveTypeEnum?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  searchQuery?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface WorkScheduleFilterPayload {
  businessId?: string;
  userId?: string;
  name?: string;
  search?: string;
  searchQuery?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}
