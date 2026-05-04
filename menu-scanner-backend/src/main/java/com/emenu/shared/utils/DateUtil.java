package com.emenu.shared.utils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class DateUtil {
    private DateUtil() {
    }

    public static LocalDateTime truncateToMidnight(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.truncatedTo(ChronoUnit.DAYS);
    }

    public static LocalDateTime truncateToDay(LocalDateTime dateTime) {
        return truncateToMidnight(dateTime);
    }

    public static boolean isPromotionActive(LocalDateTime fromDate, LocalDateTime toDate) {
        if (fromDate == null || toDate == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        return !now.isBefore(fromDate) && !now.isAfter(toDate);
    }

    public static LocalDateTime getStartOfDay(LocalDateTime dateTime) {
        return truncateToMidnight(dateTime);
    }

    public static LocalDateTime getEndOfDay(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.truncatedTo(ChronoUnit.DAYS).plusDays(1).minusSeconds(1);
    }
}
