package com.emenu.features.auth.models;

import com.emenu.enums.user.BusinessStatus;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.shared.constants.AuthStatusMessages;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Business extends BaseUUIDEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BusinessStatus status = BusinessStatus.PENDING;

    @Column(name = "is_subscription_active")
    private Boolean isSubscriptionActive = false;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subscription> subscriptions;

    public boolean isActive() {
        return BusinessStatus.ACTIVE.equals(status);
    }

    public boolean hasActiveSubscription() {
        if (Boolean.TRUE.equals(isSubscriptionActive)) {
            return true;
        }
        if (subscriptions != null && !subscriptions.isEmpty()) {
            return subscriptions.stream().anyMatch(Subscription::isActive);
        }
        return false;
    }

    public void activateSubscription() {
        this.isSubscriptionActive = true;
        this.status = BusinessStatus.ACTIVE;
    }

    public void deactivateSubscription() {
        this.isSubscriptionActive = false;
        this.status = BusinessStatus.SUSPENDED;
    }

    /**
     * Check if subscription is within grace period (up to 7 days after expiration)
     * @return true if subscription is expired but within grace period
     */
    public boolean isInSubscriptionGracePeriod() {
        if (subscriptions == null || subscriptions.isEmpty()) {
            return false;
        }

        return subscriptions.stream()
                .filter(Subscription::isExpired)
                .anyMatch(subscription -> {
                    long daysExpired = ChronoUnit.DAYS.between(
                            subscription.getEndDate().toLocalDate(),
                            LocalDateTime.now().toLocalDate()
                    );
                    return daysExpired > 0 && daysExpired <= AuthStatusMessages.SUBSCRIPTION_GRACE_PERIOD_DAYS;
                });
    }

    /**
     * Get the most recent subscription for grace period calculations
     */
    public Subscription getMostRecentSubscription() {
        if (subscriptions == null || subscriptions.isEmpty()) {
            return null;
        }

        return subscriptions.stream()
                .max((s1, s2) -> s1.getEndDate().compareTo(s2.getEndDate()))
                .orElse(null);
    }

    /**
     * Get days remaining in grace period
     * @return remaining days in grace period, 0 if grace period is over or no expired subscription
     */
    public long getDaysRemainingInGracePeriod() {
        if (!isInSubscriptionGracePeriod()) {
            return 0;
        }

        Subscription mostRecent = getMostRecentSubscription();
        if (mostRecent == null) {
            return 0;
        }

        long daysExpired = ChronoUnit.DAYS.between(
                mostRecent.getEndDate().toLocalDate(),
                LocalDateTime.now().toLocalDate()
        );

        long remaining = AuthStatusMessages.SUBSCRIPTION_GRACE_PERIOD_DAYS - daysExpired;
        return Math.max(0, remaining);
    }
}