package com.emenu.features.dashboard.service.impl;

import com.emenu.enums.user.UserType;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.User;
import com.emenu.features.dashboard.dto.response.OwnerDashboardDailyTrendsResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardPlanBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardRecentOwnersResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardStatusBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardSummaryResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardTrendsResponse;
import com.emenu.features.dashboard.service.OwnerDashboardService;
import com.emenu.features.dashboard.util.DashboardPeriodUtil;
import com.emenu.features.subscription.models.Subscription;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OwnerDashboardServiceImpl implements OwnerDashboardService {

    private static final String FIXED_PERIOD = "30D";

    @PersistenceContext
    private EntityManager em;

    @Value("${app.subscription.expiry-soon-days:7}")
    private int expirySoonDays;

    // ─── Summary ─────────────────────────────────────────────────────────────

    @Override
    public OwnerDashboardSummaryResponse getSummary() {
        LocalDateTime[] range    = DashboardPeriodUtil.getRange(FIXED_PERIOD);
        LocalDateTime start      = range[0];
        LocalDateTime end        = range[1];
        LocalDateTime prevStart  = start.minusDays(30);
        LocalDateTime prevEnd    = start;
        LocalDateTime now        = LocalDateTime.now();
        LocalDateTime threshold  = now.plusDays(expirySoonDays);

        Long totalBusinessOwners = (Long) em.createQuery(
                "SELECT COUNT(u) FROM User u WHERE u.userType = :type AND u.isDeleted = false")
                .setParameter("type", UserType.BUSINESS_USER)
                .getSingleResult();

        Long newOwnersThisPeriod = (Long) em.createQuery(
                "SELECT COUNT(u) FROM User u WHERE u.userType = :type AND u.isDeleted = false " +
                "AND u.createdAt BETWEEN :start AND :end")
                .setParameter("type", UserType.BUSINESS_USER)
                .setParameter("start", start).setParameter("end", end)
                .getSingleResult();

        Long newOwnersPrev = (Long) em.createQuery(
                "SELECT COUNT(u) FROM User u WHERE u.userType = :type AND u.isDeleted = false " +
                "AND u.createdAt BETWEEN :prevStart AND :prevEnd")
                .setParameter("type", UserType.BUSINESS_USER)
                .setParameter("prevStart", prevStart).setParameter("prevEnd", prevEnd)
                .getSingleResult();

        Long activeSubscriptions = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s WHERE s.endDate > :now AND s.isDeleted = false")
                .setParameter("now", now).getSingleResult();

        Long expiringSoonSubscriptions = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate > :now AND s.endDate <= :threshold AND s.isDeleted = false")
                .setParameter("now", now).setParameter("threshold", threshold)
                .getSingleResult();

        Long expiredSubscriptions = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s WHERE s.endDate <= :now AND s.isDeleted = false")
                .setParameter("now", now).getSingleResult();

        BigDecimal totalRevenue = toBigDecimal(em.createQuery(
                "SELECT COALESCE(SUM(sp.amount), 0) FROM SubscriptionPayment sp " +
                "WHERE sp.createdAt BETWEEN :start AND :end AND sp.isDeleted = false")
                .setParameter("start", start).setParameter("end", end)
                .getSingleResult());

        BigDecimal prevRevenue = toBigDecimal(em.createQuery(
                "SELECT COALESCE(SUM(sp.amount), 0) FROM SubscriptionPayment sp " +
                "WHERE sp.createdAt BETWEEN :prevStart AND :prevEnd AND sp.isDeleted = false")
                .setParameter("prevStart", prevStart).setParameter("prevEnd", prevEnd)
                .getSingleResult());

        return OwnerDashboardSummaryResponse.builder()
                .totalBusinessOwners(totalBusinessOwners)
                .newOwnersThisPeriod(newOwnersThisPeriod)
                .newOwnersChange(DashboardPeriodUtil.percentageChange(
                        newOwnersThisPeriod.doubleValue(), newOwnersPrev.doubleValue()))
                .activeSubscriptions(activeSubscriptions)
                .expiringSoonSubscriptions(expiringSoonSubscriptions)
                .expiredSubscriptions(expiredSubscriptions)
                .totalRevenue(totalRevenue)
                .revenueChange(DashboardPeriodUtil.percentageChange(
                        totalRevenue.doubleValue(), prevRevenue.doubleValue()))
                .build();
    }

    // ─── Subscription Trends (30D) ────────────────────────────────────────────

    @Override
    public OwnerDashboardTrendsResponse getTrends() {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(FIXED_PERIOD);
        LocalDateTime start   = range[0];
        LocalDateTime end     = range[1];

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT FUNCTION('DATE', s.createdAt), COUNT(s), COALESCE(SUM(sp.amount), 0) " +
                "FROM Subscription s " +
                "LEFT JOIN SubscriptionPayment sp ON sp.subscriptionId = s.id AND sp.isDeleted = false " +
                "WHERE s.createdAt BETWEEN :start AND :end AND s.isDeleted = false " +
                "GROUP BY FUNCTION('DATE', s.createdAt) " +
                "ORDER BY FUNCTION('DATE', s.createdAt)")
                .setParameter("start", start).setParameter("end", end)
                .getResultList();

        List<OwnerDashboardTrendsResponse.TrendPoint> points = new ArrayList<>();
        long totalNewSubscriptions = 0L;
        BigDecimal totalRevenue    = BigDecimal.ZERO;

        for (Object[] row : rows) {
            long cnt       = toLong(row[1]);
            BigDecimal rev = toBigDecimal(row[2]);
            points.add(OwnerDashboardTrendsResponse.TrendPoint.builder()
                    .date(row[0] != null ? row[0].toString() : "")
                    .newSubscriptions(cnt)
                    .revenue(rev)
                    .build());
            totalNewSubscriptions += cnt;
            totalRevenue = totalRevenue.add(rev);
        }

        return OwnerDashboardTrendsResponse.builder()
                .data(points).totalNewSubscriptions(totalNewSubscriptions).totalRevenue(totalRevenue)
                .build();
    }

    // ─── Status Breakdown ────────────────────────────────────────────────────

    @Override
    public OwnerDashboardStatusBreakdownResponse getStatusBreakdown() {
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(expirySoonDays);

        Long active = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s WHERE s.endDate > :now AND s.isDeleted = false AND s.cancellationReason IS NULL")
                .setParameter("now", now).getSingleResult();

        Long expiringSoon = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate > :now AND s.endDate <= :threshold AND s.isDeleted = false AND s.cancellationReason IS NULL")
                .setParameter("now", now).setParameter("threshold", threshold).getSingleResult();

        Long expired = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s WHERE s.endDate <= :now AND s.isDeleted = false AND s.cancellationReason IS NULL")
                .setParameter("now", now).getSingleResult();

        Long cancelled = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s WHERE s.isDeleted = false AND s.cancellationReason IS NOT NULL")
                .getSingleResult();

        long total = active + expired + cancelled;

        return OwnerDashboardStatusBreakdownResponse.builder()
                .active(active).expiringSoon(expiringSoon).expired(expired).cancelled(cancelled).total(total)
                .activePercent(total > 0 ? roundOne(active * 100.0 / total) : 0.0)
                .expiringSoonPercent(total > 0 ? roundOne(expiringSoon * 100.0 / total) : 0.0)
                .expiredPercent(total > 0 ? roundOne(expired * 100.0 / total) : 0.0)
                .cancelledPercent(total > 0 ? roundOne(cancelled * 100.0 / total) : 0.0)
                .build();
    }

    // ─── Recent Owners ────────────────────────────────────────────────────────

    @Override
    public OwnerDashboardRecentOwnersResponse getRecentOwners() {
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(expirySoonDays);

        @SuppressWarnings("unchecked")
        List<User> users = em.createQuery(
                "SELECT u FROM User u LEFT JOIN FETCH u.profile LEFT JOIN FETCH u.business " +
                "WHERE u.userType = :type AND u.isDeleted = false ORDER BY u.createdAt DESC")
                .setParameter("type", UserType.BUSINESS_USER)
                .setMaxResults(5).getResultList();

        List<OwnerDashboardRecentOwnersResponse.RecentOwner> result = new ArrayList<>();

        for (User u : users) {
            UUID businessId = u.getBusinessId();
            Optional<Subscription> latestSub = Optional.empty();
            if (businessId != null) {
                @SuppressWarnings("unchecked")
                List<Subscription> subs = em.createQuery(
                        "SELECT s FROM Subscription s LEFT JOIN FETCH s.plan " +
                        "WHERE s.businessId = :bId AND s.isDeleted = false ORDER BY s.endDate DESC")
                        .setParameter("bId", businessId).setMaxResults(1).getResultList();
                latestSub = subs.stream().findFirst();
            }
            String logoUrl = null;
            if (businessId != null) {
                @SuppressWarnings("unchecked")
                List<BusinessSetting> settings = em.createQuery(
                        "SELECT bs FROM BusinessSetting bs WHERE bs.businessId = :bId AND bs.isDeleted = false")
                        .setParameter("bId", businessId).setMaxResults(1).getResultList();
                if (!settings.isEmpty()) logoUrl = settings.get(0).getLogoBusinessUrl();
            }

            String planName = null, status = null;
            Long daysRemaining = null;
            if (latestSub.isPresent()) {
                Subscription sub = latestSub.get();
                planName     = sub.getPlan() != null ? sub.getPlan().getName() : null;
                daysRemaining = sub.getDaysRemaining();
                status = sub.isCancelled() ? "CANCELLED"
                        : sub.isExpired() ? "EXPIRED"
                        : sub.isExpiringSoon(expirySoonDays) ? "EXPIRING_SOON" : "ACTIVE";
            }

            String ownerName = u.getProfile() != null ? u.getProfile().getFullName() : u.getUserIdentifier();
            result.add(OwnerDashboardRecentOwnersResponse.RecentOwner.builder()
                    .ownerId(u.getId().toString())
                    .ownerName(ownerName)
                    .businessName(u.getBusiness() != null ? u.getBusiness().getName() : null)
                    .planName(planName)
                    .subscriptionStatus(status)
                    .daysRemaining(daysRemaining)
                    .joinedAt(u.getCreatedAt())
                    .logoUrl(logoUrl)
                    .build());
        }
        return OwnerDashboardRecentOwnersResponse.builder().data(result).build();
    }

    // ─── Plan Breakdown ───────────────────────────────────────────────────────

    @Override
    public OwnerDashboardPlanBreakdownResponse getPlanBreakdown() {
        LocalDateTime now = LocalDateTime.now();

        @SuppressWarnings("unchecked")
        List<Object[]> activeRows = em.createQuery(
                "SELECT p.name, COUNT(s) FROM Subscription s JOIN s.plan p " +
                "WHERE s.endDate > :now AND s.isDeleted = false GROUP BY p.name ORDER BY COUNT(s) DESC")
                .setParameter("now", now).getResultList();

        @SuppressWarnings("unchecked")
        List<Object[]> totalRows = em.createQuery(
                "SELECT p.name, COUNT(s) FROM Subscription s JOIN s.plan p " +
                "WHERE s.isDeleted = false GROUP BY p.name").getResultList();

        Map<String, Long> totalByPlan = new HashMap<>();
        for (Object[] row : totalRows)
            totalByPlan.put(row[0] != null ? row[0].toString() : "Unknown", toLong(row[1]));

        long totalActive = activeRows.stream().mapToLong(r -> toLong(r[1])).sum();
        List<OwnerDashboardPlanBreakdownResponse.PlanStat> stats = new ArrayList<>();

        for (Object[] row : activeRows) {
            String name  = row[0] != null ? row[0].toString() : "Unknown";
            long active  = toLong(row[1]);
            stats.add(OwnerDashboardPlanBreakdownResponse.PlanStat.builder()
                    .planName(name).activeCount(active)
                    .totalCount(totalByPlan.getOrDefault(name, active))
                    .percentage(totalActive > 0 ? roundOne(active * 100.0 / totalActive) : 0.0)
                    .build());
        }
        return OwnerDashboardPlanBreakdownResponse.builder().data(stats).build();
    }

    // ─── Customer Trends (30D) ────────────────────────────────────────────────

    @Override
    public OwnerDashboardDailyTrendsResponse getCustomerTrends() {
        return buildUserTypeTrends(UserType.CUSTOMER);
    }

    // ─── Business User Trends (30D) ───────────────────────────────────────────

    @Override
    public OwnerDashboardDailyTrendsResponse getUserTrends() {
        return buildUserTypeTrends(UserType.BUSINESS_USER);
    }

    // ─── Payment Trends (30D) ────────────────────────────────────────────────

    @Override
    public OwnerDashboardDailyTrendsResponse getPaymentTrends() {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(FIXED_PERIOD);
        LocalDateTime start   = range[0];
        LocalDateTime end     = range[1];

        // Fill all 30 days so gaps show as 0
        Map<String, BigDecimal> dailyMap = new HashMap<>();
        fillDailyDates(dailyMap, start, end);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT FUNCTION('DATE', sp.createdAt), COALESCE(SUM(sp.amount), 0) " +
                "FROM SubscriptionPayment sp " +
                "WHERE sp.createdAt BETWEEN :start AND :end AND sp.isDeleted = false " +
                "GROUP BY FUNCTION('DATE', sp.createdAt) " +
                "ORDER BY FUNCTION('DATE', sp.createdAt)")
                .setParameter("start", start).setParameter("end", end)
                .getResultList();

        for (Object[] row : rows) {
            if (row[0] != null) dailyMap.put(row[0].toString(), toBigDecimal(row[1]));
        }

        List<OwnerDashboardDailyTrendsResponse.DailyPoint> points = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (Map.Entry<String, BigDecimal> e : new java.util.TreeMap<>(dailyMap).entrySet()) {
            points.add(OwnerDashboardDailyTrendsResponse.DailyPoint.builder()
                    .date(e.getKey()).count(0L).amount(e.getValue()).build());
            totalAmount = totalAmount.add(e.getValue());
        }

        return OwnerDashboardDailyTrendsResponse.builder()
                .data(points).totalCount(0L).totalAmount(totalAmount).build();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private OwnerDashboardDailyTrendsResponse buildUserTypeTrends(UserType userType) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(FIXED_PERIOD);
        LocalDateTime start   = range[0];
        LocalDateTime end     = range[1];

        Map<String, Long> dailyMap = new java.util.LinkedHashMap<>();
        fillDailyCountMap(dailyMap, start, end);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT FUNCTION('DATE', u.createdAt), COUNT(u) " +
                "FROM User u " +
                "WHERE u.userType = :type AND u.isDeleted = false " +
                "AND u.createdAt BETWEEN :start AND :end " +
                "GROUP BY FUNCTION('DATE', u.createdAt) " +
                "ORDER BY FUNCTION('DATE', u.createdAt)")
                .setParameter("type", userType)
                .setParameter("start", start).setParameter("end", end)
                .getResultList();

        for (Object[] row : rows) {
            if (row[0] != null) dailyMap.put(row[0].toString(), toLong(row[1]));
        }

        List<OwnerDashboardDailyTrendsResponse.DailyPoint> points = new ArrayList<>();
        long totalCount = 0L;

        for (Map.Entry<String, Long> e : new java.util.TreeMap<>(dailyMap).entrySet()) {
            points.add(OwnerDashboardDailyTrendsResponse.DailyPoint.builder()
                    .date(e.getKey()).count(e.getValue()).amount(BigDecimal.ZERO).build());
            totalCount += e.getValue();
        }

        return OwnerDashboardDailyTrendsResponse.builder()
                .data(points).totalCount(totalCount).totalAmount(BigDecimal.ZERO).build();
    }

    private void fillDailyDates(Map<String, BigDecimal> map, LocalDateTime start, LocalDateTime end) {
        LocalDate d = start.toLocalDate();
        LocalDate last = end.toLocalDate();
        while (!d.isAfter(last)) {
            map.put(d.toString(), BigDecimal.ZERO);
            d = d.plusDays(1);
        }
    }

    private void fillDailyCountMap(Map<String, Long> map, LocalDateTime start, LocalDateTime end) {
        LocalDate d = start.toLocalDate();
        LocalDate last = end.toLocalDate();
        while (!d.isAfter(last)) {
            map.put(d.toString(), 0L);
            d = d.plusDays(1);
        }
    }

    private BigDecimal toBigDecimal(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(v.toString()); } catch (Exception e) { return BigDecimal.ZERO; }
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString()); } catch (Exception e) { return 0L; }
    }

    private double roundOne(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
