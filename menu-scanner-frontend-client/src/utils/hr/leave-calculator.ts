/**
 * Leave Quota Pro-Rata Calculator Utility
 * Calculates staff annual/sick/special leave entitlements dynamically based on join date, month, and target year.
 */

export interface UserLeaveQuotaResult {
  targetYear: number;
  joinDate?: string;
  joinMonth?: number;
  joinYear?: number;
  monthsWorkedInYear: number;
  annualLeaveQuota: number;
  sickLeaveQuota: number;
  specialLeaveQuota: number;
  monthlyAnnualLeaveAccrual: number;
  isProRated: boolean;
  proRatedLabel: string;
}

export function calculateUserProRatedLeaveQuota({
  joinDate,
  targetYear = new Date().getFullYear(),
  annualLeaveDaysPerYear = 18,
  sickLeaveDaysPerYear = 10,
  specialLeaveDaysPerYear = 5,
}: {
  joinDate?: string;
  targetYear?: number;
  annualLeaveDaysPerYear?: number;
  sickLeaveDaysPerYear?: number;
  specialLeaveDaysPerYear?: number;
}): UserLeaveQuotaResult {
  const monthlyAccrual = Math.round((annualLeaveDaysPerYear / 12) * 100) / 100;

  if (!joinDate || !joinDate.trim()) {
    return {
      targetYear,
      monthsWorkedInYear: 12,
      annualLeaveQuota: annualLeaveDaysPerYear,
      sickLeaveQuota: sickLeaveDaysPerYear,
      specialLeaveQuota: specialLeaveDaysPerYear,
      monthlyAnnualLeaveAccrual: monthlyAccrual,
      isProRated: false,
      proRatedLabel: `Full Year (${targetYear}): 12/12 Months`,
    };
  }

  const join = new Date(joinDate);
  if (isNaN(join.getTime())) {
    return {
      targetYear,
      monthsWorkedInYear: 12,
      annualLeaveQuota: annualLeaveDaysPerYear,
      sickLeaveQuota: sickLeaveDaysPerYear,
      specialLeaveQuota: specialLeaveDaysPerYear,
      monthlyAnnualLeaveAccrual: monthlyAccrual,
      isProRated: false,
      proRatedLabel: `Full Year (${targetYear}): 12/12 Months`,
    };
  }

  const joinYear = join.getFullYear();
  const joinMonth = join.getMonth() + 1; // 1 to 12

  // Staff joins after target year -> 0 leave days
  if (joinYear > targetYear) {
    return {
      targetYear,
      joinDate,
      joinMonth,
      joinYear,
      monthsWorkedInYear: 0,
      annualLeaveQuota: 0,
      sickLeaveQuota: 0,
      specialLeaveQuota: 0,
      monthlyAnnualLeaveAccrual: monthlyAccrual,
      isProRated: true,
      proRatedLabel: `Not Started in ${targetYear} (Joins ${joinDate})`,
    };
  }

  // Staff joined in a previous year -> Full 12 months for targetYear
  if (joinYear < targetYear) {
    return {
      targetYear,
      joinDate,
      joinMonth,
      joinYear,
      monthsWorkedInYear: 12,
      annualLeaveQuota: annualLeaveDaysPerYear,
      sickLeaveQuota: sickLeaveDaysPerYear,
      specialLeaveQuota: specialLeaveDaysPerYear,
      monthlyAnnualLeaveAccrual: monthlyAccrual,
      isProRated: false,
      proRatedLabel: `Full Year (${targetYear}): 12/12 Months (Joined ${joinYear})`,
    };
  }

  // Staff joined in targetYear -> Pro-rated for remaining months (e.g. joined Month 6 = 7 months)
  const monthsWorked = Math.max(1, 12 - joinMonth + 1);
  const annualLeaveQuota = Math.round(((annualLeaveDaysPerYear / 12) * monthsWorked) * 10) / 10;
  const sickLeaveQuota = Math.round(((sickLeaveDaysPerYear / 12) * monthsWorked) * 10) / 10;
  const specialLeaveQuota = Math.round(((specialLeaveDaysPerYear / 12) * monthsWorked) * 10) / 10;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return {
    targetYear,
    joinDate,
    joinMonth,
    joinYear,
    monthsWorkedInYear: monthsWorked,
    annualLeaveQuota,
    sickLeaveQuota,
    specialLeaveQuota,
    monthlyAnnualLeaveAccrual: monthlyAccrual,
    isProRated: true,
    proRatedLabel: `Pro-Rated ${targetYear}: ${monthsWorked}/12 Months (Joined Month ${joinMonth} - ${monthNames[joinMonth - 1]})`,
  };
}
