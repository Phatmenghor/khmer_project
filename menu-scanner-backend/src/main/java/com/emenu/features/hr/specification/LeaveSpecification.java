package com.emenu.features.hr.specification;

import com.emenu.enums.hr.LeaveStatusEnum;
import com.emenu.features.hr.models.Leave;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class LeaveSpecification {

    public static Specification<Leave> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Leave> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Leave> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<Leave> byLeaveTypeEnum(String leaveTypeEnum) {
        return (root, query, cb) -> {
            if (leaveTypeEnum == null) return cb.conjunction();
            return cb.equal(root.get("leaveTypeEnum"), leaveTypeEnum);
        };
    }

    public static Specification<Leave> byStatuses(List<LeaveStatusEnum> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<Leave> byStartDate(LocalDate startDate) {
        return (root, query, cb) -> {
            if (startDate == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("startDate"), startDate);
        };
    }

    public static Specification<Leave> byEndDate(LocalDate endDate) {
        return (root, query, cb) -> {
            if (endDate == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("endDate"), endDate);
        };
    }

    public static Specification<Leave> searchByReason(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("reason")), pattern);
        };
    }

    public static Specification<Leave> findWithFilters(UUID businessId, UUID userId, String leaveTypeEnum,
                                                        List<LeaveStatusEnum> status, LocalDate startDate,
                                                        LocalDate endDate, String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byUserId(userId))
                .and(byLeaveTypeEnum(leaveTypeEnum))
                .and(byStatuses(status))
                .and(byStartDate(startDate))
                .and(byEndDate(endDate))
                .and(searchByReason(search));
    }
}
