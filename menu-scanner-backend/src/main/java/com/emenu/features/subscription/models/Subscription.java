package com.emenu.features.subscription.models;

import com.emenu.features.auth.models.Business;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "subscriptions",
        indexes = {
                @Index(name = "idx_subscriptions_business_id", columnList = "business_id"),
                @Index(name = "idx_subscriptions_end_date",    columnList = "end_date"),
                @Index(name = "idx_subscriptions_plan_id",     columnList = "plan_id")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Subscription extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", insertable = false, updatable = false)
    private Business business;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private SubscriptionPlan plan;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "plan_change_reason", columnDefinition = "TEXT")
    private String planChangeReason;

    @OneToOne(mappedBy = "subscription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SubscriptionPayment payment;

    public boolean isCancelled() {
        return cancellationReason != null;
    }

    public boolean isPlanChanged() {
        return planChangeReason != null;
    }

    public boolean isActive() {
        return !getIsDeleted() && !isExpired() && !isCancelled() && !isPlanChanged();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(endDate);
    }

    public String getStatus() {
        if (isPlanChanged()) return "CHANGE_PLAN";
        if (isCancelled()) return "CANCELLED";
        return isActive() ? "ACTIVE" : "EXPIRED";
    }

    public long getDaysRemaining() {
        if (isExpired()) return 0;
        return ChronoUnit.DAYS.between(LocalDate.now(), endDate.toLocalDate());
    }

    public boolean isExpiringSoon(int days) {
        if (isExpired()) return false;
        long daysRemaining = getDaysRemaining();
        return daysRemaining > 0 && daysRemaining <= days;
    }

    public String getDisplayName() {
        return plan != null ? plan.getName() : "Unknown Plan";
    }

    public void cancel() {
        this.autoRenew = false;
    }
}
