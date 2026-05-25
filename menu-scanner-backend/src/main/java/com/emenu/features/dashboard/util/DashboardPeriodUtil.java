package com.emenu.features.dashboard.util;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class DashboardPeriodUtil {

    private DashboardPeriodUtil() {}

    /** Returns [start, end] for the requested period. */
    public static LocalDateTime[] getRange(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = switch (period != null ? period.toUpperCase() : "TODAY") {
            case "7D"  -> now.minusDays(7).toLocalDate().atStartOfDay();
            case "30D" -> now.minusDays(30).toLocalDate().atStartOfDay();
            case "90D" -> now.minusDays(90).toLocalDate().atStartOfDay();
            default    -> LocalDate.now().atStartOfDay(); // TODAY
        };
        return new LocalDateTime[]{start, now};
    }

    /** Returns [start, end] for today only. */
    public static LocalDateTime[] getTodayRange() {
        return new LocalDateTime[]{LocalDate.now().atStartOfDay(), LocalDateTime.now()};
    }

    /** Returns [start, end] for yesterday only. */
    public static LocalDateTime[] getYesterdayRange() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        return new LocalDateTime[]{yesterday.atStartOfDay(), yesterday.atTime(23, 59, 59)};
    }

    /** Safe percentage change: ((current - previous) / previous) * 100. */
    public static double percentageChange(double current, double previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - previous) / previous) * 100.0;
    }
}
