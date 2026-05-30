package com.emenu.features.hr.specification;

import com.emenu.features.hr.models.Attendance;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.UUID;

public class AttendanceSpecification {

    public static Specification<Attendance> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Attendance> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Attendance> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<Attendance> byStartDate(LocalDate startDate) {
        return (root, query, cb) -> {
            if (startDate == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("attendanceDate"), startDate);
        };
    }

    public static Specification<Attendance> byEndDate(LocalDate endDate) {
        return (root, query, cb) -> {
            if (endDate == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("attendanceDate"), endDate);
        };
    }

    public static Specification<Attendance> searchByRemarks(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("remarks")), pattern);
        };
    }

    public static Specification<Attendance> findWithFilters(UUID businessId, UUID userId,
                                                             LocalDate startDate, LocalDate endDate, String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byUserId(userId))
                .and(byStartDate(startDate))
                .and(byEndDate(endDate))
                .and(searchByRemarks(search));
    }
}
