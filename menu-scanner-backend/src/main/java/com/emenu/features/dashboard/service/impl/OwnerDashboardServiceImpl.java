package com.emenu.features.dashboard.service.impl;

import com.emenu.enums.user.UserType;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.User;
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
import java.time.Duration;
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

    @PersistenceContext
    private EntityManager em;

    @Value("${app.subscription.expiry-soon-days:7}")
    private int expirySoonDays;

    // ─── Summary ─────────────────────────────────────────────────────────────

    @Override
    public OwnerDashboardSummaryResponse getSummary(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);
        LocalDateTime start = range[0];
        LocalDateTime end   = range[1];

        Duration duration  = Duration.between(start, end);
        LocalDateTime prevStart = start.minus(duration);
        LocalDateTime prevEnd   = start;

        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(expirySoonDays);

        // Total business owners (all time)
        Long totalBusinessOwners = (Long) em.createQuery(
                "SELECT COUNT(u) FROM User u " +
                "WHERE u.userType = :type AND u.isDeleted = false")
                .setParameter("type", UserType.BUSINESS_USER)
                .getSingleResult();

        // New owners in current period
        Long newOwnersThisPeriod = (Long) em.createQuery(
                "SELECT COUNT(u) FROM User u " +
                "WHERE u.userType = :type AND u.isDeleted = false " +
                "AND u.createdAt BETWEEN :start AND :end")
                .setParameter("type",  UserType.BUSINESS_USER)
                .setParameter("start", start)
                .setParameter("end",   end)
                .getSingleResult();

        // New owners in previous period
        Long newOwnersPrev = (Long) em.createQuery(
                "SELECT COUNT(u) FROM User u " +
                "WHERE u.userType = :type AND u.isDeleted = false " +
                "AND u.createdAt BETWEEN :prevStart AND :prevEnd")
                .setParameter("type",      UserType.BUSINESS_USER)
                .setParameter("prevStart", prevStart)
                .setParameter("prevEnd",   prevEnd)
                .getSingleResult();

        // Active subscriptions (endDate > now)
        Long activeSubscriptions = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate > :now AND s.isDeleted = false")
                .setParameter("now", now)
                .getSingleResult();

        // Expiring soon subscriptions
        Long expiringSoonSubscriptions = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate > :now AND s.endDate <= :threshold AND s.isDeleted = false")
                .setParameter("now",       now)
                .setParameter("threshold", threshold)
                .getSingleResult();

        // Expired subscriptions
        Long expiredSubscriptions = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate <= :now AND s.isDeleted = false")
                .setParameter("now", now)
                .getSingleResult();

        // Total revenue in current period
        Object revenueResult = em.createQuery(
                "SELECT COALESCE(SUM(sp.amount), 0) FROM SubscriptionPayment sp " +
                "WHERE sp.createdAt BETWEEN :start AND :end AND sp.isDeleted = false")
                .setParameter("start", start)
                .setParameter("end",   end)
                .getSingleResult();
        BigDecimal totalRevenue = toBigDecimal(revenueResult);

        // Revenue in previous period
        Object prevRevenueResult = em.createQuery(
                "SELECT COALESCE(SUM(sp.amount), 0) FROM SubscriptionPayment sp " +
                "WHERE sp.createdAt BETWEEN :prevStart AND :prevEnd AND sp.isDeleted = false")
                .setParameter("prevStart", prevStart)
                .setParameter("prevEnd",   prevEnd)
                .getSingleResult();
        BigDecimal prevRevenue = toBigDecimal(prevRevenueResult);

        double newOwnersChange = DashboardPeriodUtil.percentageChange(
                newOwnersThisPeriod.doubleValue(), newOwnersPrev.doubleValue());
        double revenueChange = DashboardPeriodUtil.percentageChange(
                totalRevenue.doubleValue(), prevRevenue.doubleValue());

        return OwnerDashboardSummaryResponse.builder()
                .totalBusinessOwners(totalBusinessOwners)
                .newOwnersThisPeriod(newOwnersThisPeriod)
                .newOwnersChange(newOwnersChange)
                .activeSubscriptions(activeSubscriptions)
                .expiringSoonSubscriptions(expiringSoonSubscriptions)
                .expiredSubscriptions(expiredSubscriptions)
                .totalRevenue(totalRevenue)
                .revenueChange(revenueChange)
                .build();
    }

    // ─── Trends ───────────────────────────────────────────────────────────────

    @Override
    public OwnerDashboardTrendsResponse getTrends(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);
        LocalDateTime start = range[0];
        LocalDateTime end   = range[1];

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT FUNCTION('DATE', s.createdAt), COUNT(s), COALESCE(SUM(sp.amount), 0) " +
                "FROM Subscription s " +
                "LEFT JOIN SubscriptionPayment sp ON sp.subscriptionId = s.id AND sp.isDeleted = false " +
                "WHERE s.createdAt BETWEEN :start AND :end AND s.isDeleted = false " +
                "GROUP BY FUNCTION('DATE', s.createdAt) " +
                "ORDER BY FUNCTION('DATE', s.createdAt)")
                .setParameter("start", start)
                .setParameter("end",   end)
                .getResultList();

        List<OwnerDashboardTrendsResponse.TrendPoint> points = new ArrayList<>();
        long totalNewSubscriptions = 0L;
        BigDecimal totalRevenue    = BigDecimal.ZERO;

        for (Object[] row : rows) {
            String date              = row[0] != null ? row[0].toString() : "";
            long newSubscriptions    = toLong(row[1]);
            BigDecimal revenue       = toBigDecimal(row[2]);

            points.add(OwnerDashboardTrendsResponse.TrendPoint.builder()
                    .date(date)
                    .newSubscriptions(newSubscriptions)
                    .revenue(revenue)
                    .build());

            totalNewSubscriptions += newSubscriptions;
            totalRevenue           = totalRevenue.add(revenue);
        }

        return OwnerDashboardTrendsResponse.builder()
                .data(points)
                .totalNewSubscriptions(totalNewSubscriptions)
                .totalRevenue(totalRevenue)
                .build();
    }

    // ─── Status Breakdown ────────────────────────────────────────────────────

    @Override
    public OwnerDashboardStatusBreakdownResponse getStatusBreakdown() {
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(expirySoonDays);

        Long active = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate > :now AND s.isDeleted = false")
                .setParameter("now", now)
                .getSingleResult();

        Long expiringSoon = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate > :now AND s.endDate <= :threshold AND s.isDeleted = false")
                .setParameter("now",       now)
                .setParameter("threshold", threshold)
                .getSingleResult();

        Long expired = (Long) em.createQuery(
                "SELECT COUNT(s) FROM Subscription s " +
                "WHERE s.endDate <= :now AND s.isDeleted = false")
                .setParameter("now", now)
                .getSingleResult();

        long total = active + expired;

        double activePercent       = total > 0 ? roundOne(active       * 100.0 / total) : 0.0;
        double expiringSoonPercent = total > 0 ? roundOne(expiringSoon * 100.0 / total) : 0.0;
        double expiredPercent      = total > 0 ? roundOne(expired      * 100.0 / total) : 0.0;

        return OwnerDashboardStatusBreakdownResponse.builder()
                .active(active)
                .expiringSoon(expiringSoon)
                .expired(expired)
                .total(total)
                .activePercent(activePercent)
                .expiringSoonPercent(expiringSoonPercent)
                .expiredPercent(expiredPercent)
                .build();
    }

    // ─── Recent Owners ────────────────────────────────────────────────────────

    @Override
    public OwnerDashboardRecentOwnersResponse getRecentOwners() {
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(expirySoonDays);

        @SuppressWarnings("unchecked")
        List<User> users = em.createQuery(
                "SELECT u FROM User u " +
                "LEFT JOIN FETCH u.profile " +
                "LEFT JOIN FETCH u.business " +
                "WHERE u.userType = :type AND u.isDeleted = false " +
                "ORDER BY u.createdAt DESC")
                .setParameter("type", UserType.BUSINESS_USER)
                .setMaxResults(5)
                .getResultList();

        List<OwnerDashboardRecentOwnersResponse.RecentOwner> recentOwners = new ArrayList<>();

        for (User u : users) {
            UUID businessId = u.getBusinessId();

            // Fetch latest subscription for this business
            Optional<Subscription> latestSubscription = Optional.empty();
            if (businessId != null) {
                @SuppressWarnings("unchecked")
                List<Subscription> subs = em.createQuery(
                        "SELECT s FROM Subscription s " +
                        "LEFT JOIN FETCH s.plan " +
                        "WHERE s.businessId = :businessId AND s.isDeleted = false " +
                        "ORDER BY s.endDate DESC")
                        .setParameter("businessId", businessId)
                        .setMaxResults(1)
                        .getResultList();
                latestSubscription = subs.stream().findFirst();
            }

            // Fetch logo from BusinessSetting
            String logoUrl = null;
            if (businessId != null) {
                @SuppressWarnings("unchecked")
                List<BusinessSetting> settings = em.createQuery(
                        "SELECT bs FROM BusinessSetting bs " +
                        "WHERE bs.businessId = :businessId AND bs.isDeleted = false")
                        .setParameter("businessId", businessId)
                        .setMaxResults(1)
                        .getResultList();
                if (!settings.isEmpty()) {
                    logoUrl = settings.get(0).getLogoBusinessUrl();
                }
            }

            String planName            = null;
            String subscriptionStatus  = null;
            Long daysRemaining         = null;

            if (latestSubscription.isPresent()) {
                Subscription sub = latestSubscription.get();
                planName         = sub.getPlan() != null ? sub.getPlan().getName() : null;
                daysRemaining    = sub.getDaysRemaining();

                if (sub.isExpired()) {
                    subscriptionStatus = "EXPIRED";
                } else if (sub.isExpiringSoon(expirySoonDays)) {
                    subscriptionStatus = "EXPIRING_SOON";
                } else {
                    subscriptionStatus = "ACTIVE";
                }
            }

            String ownerName     = u.getProfile() != null ? u.getProfile().getFullName() : null;
            if (ownerName == null) ownerName = u.getUserIdentifier();

            String businessName  = u.getBusiness() != null ? u.getBusiness().getName() : null;

            recentOwners.add(OwnerDashboardRecentOwnersResponse.RecentOwner.builder()
                    .ownerId(u.getId().toString())
                    .ownerName(ownerName)
                    .businessName(businessName)
                    .planName(planName)
                    .subscriptionStatus(subscriptionStatus)
                    .daysRemaining(daysRemaining)
                    .joinedAt(u.getCreatedAt())
                    .logoUrl(logoUrl)
                    .build());
        }

        return OwnerDashboardRecentOwnersResponse.builder()
                .data(recentOwners)
                .build();
    }

    // ─── Plan Breakdown ───────────────────────────────────────────────────────

    @Override
    public OwnerDashboardPlanBreakdownResponse getPlanBreakdown() {
        LocalDateTime now = LocalDateTime.now();

        // Active subscriptions grouped by plan name
        @SuppressWarnings("unchecked")
        List<Object[]> activeRows = em.createQuery(
                "SELECT p.name, COUNT(s) " +
                "FROM Subscription s JOIN s.plan p " +
                "WHERE s.endDate > :now AND s.isDeleted = false " +
                "GROUP BY p.name ORDER BY COUNT(s) DESC")
                .setParameter("now", now)
                .getResultList();

        // Total subscriptions (all statuses) grouped by plan name
        @SuppressWarnings("unchecked")
        List<Object[]> totalRows = em.createQuery(
                "SELECT p.name, COUNT(s) " +
                "FROM Subscription s JOIN s.plan p " +
                "WHERE s.isDeleted = false " +
                "GROUP BY p.name")
                .getResultList();

        Map<String, Long> totalByPlan = new HashMap<>();
        for (Object[] row : totalRows) {
            String planName = row[0] != null ? row[0].toString() : "Unknown";
            totalByPlan.put(planName, toLong(row[1]));
        }

        // Total active subscriptions across all plans (for percentage calculation)
        long totalActive = activeRows.stream().mapToLong(r -> toLong(r[1])).sum();

        List<OwnerDashboardPlanBreakdownResponse.PlanStat> planStats = new ArrayList<>();
        for (Object[] row : activeRows) {
            String planName  = row[0] != null ? row[0].toString() : "Unknown";
            long activeCount = toLong(row[1]);
            long totalCount  = totalByPlan.getOrDefault(planName, activeCount);
            double percentage = totalActive > 0 ? roundOne(activeCount * 100.0 / totalActive) : 0.0;

            planStats.add(OwnerDashboardPlanBreakdownResponse.PlanStat.builder()
                    .planName(planName)
                    .activeCount(activeCount)
                    .totalCount(totalCount)
                    .percentage(percentage)
                    .build());
        }

        return OwnerDashboardPlanBreakdownResponse.builder()
                .data(planStats)
                .build();
    }

    // ─── Type conversion helpers ──────────────────────────────────────────────

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
