package com.emenu.features.subscription.models;

import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "subscription_plans")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan extends BaseUUIDEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubscriptionPlanStatus status = SubscriptionPlanStatus.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "duration_type", nullable = false)
    private SubscriptionPlanDurationType durationType = SubscriptionPlanDurationType.MONTHLY;

    // Relationships
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Subscription> subscriptions;

    public LocalDateTime calculateEndDate(LocalDateTime from) {
        return switch (durationType) {
            case FREE_TRIAL -> from.plusDays(7);
            case MONTHLY -> from.plusMonths(1);
            case SIX_MONTHS -> from.plusMonths(6);
            case YEARLY -> from.plusYears(1);
        };
    }
}