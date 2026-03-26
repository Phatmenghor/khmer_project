package com.emenu.features.order.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_item_pricing_snapshots")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemPricingSnapshot extends BaseUUIDEntity {

    @Column(name = "order_item_id", nullable = false)
    private UUID orderItemId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", insertable = false, updatable = false)
    private OrderItem orderItem;

    // ===== BEFORE Snapshot =====
    @Column(name = "before_current_price", precision = 19, scale = 2)
    private BigDecimal beforeCurrentPrice;

    @Column(name = "before_final_price", precision = 19, scale = 2)
    private BigDecimal beforeFinalPrice;

    @Column(name = "before_has_active_promotion")
    private Boolean beforeHasActivePromotion;

    @Column(name = "before_discount_amount", precision = 19, scale = 2)
    private BigDecimal beforeDiscountAmount;

    @Column(name = "before_total_price", precision = 19, scale = 2)
    private BigDecimal beforeTotalPrice;

    @Column(name = "before_promotion_type", length = 50)
    private String beforePromotionType;

    @Column(name = "before_promotion_value", precision = 19, scale = 2)
    private BigDecimal beforePromotionValue;

    @Column(name = "before_promotion_from_date")
    private LocalDateTime beforePromotionFromDate;

    @Column(name = "before_promotion_to_date")
    private LocalDateTime beforePromotionToDate;

    // ===== AFTER Snapshot =====
    @Column(name = "after_current_price", precision = 19, scale = 2)
    private BigDecimal afterCurrentPrice;

    @Column(name = "after_final_price", precision = 19, scale = 2)
    private BigDecimal afterFinalPrice;

    @Column(name = "after_has_active_promotion")
    private Boolean afterHasActivePromotion;

    @Column(name = "after_discount_amount", precision = 19, scale = 2)
    private BigDecimal afterDiscountAmount;

    @Column(name = "after_total_price", precision = 19, scale = 2)
    private BigDecimal afterTotalPrice;

    @Column(name = "after_promotion_type", length = 50)
    private String afterPromotionType;

    @Column(name = "after_promotion_value", precision = 19, scale = 2)
    private BigDecimal afterPromotionValue;

    @Column(name = "after_promotion_from_date")
    private LocalDateTime afterPromotionFromDate;

    @Column(name = "after_promotion_to_date")
    private LocalDateTime afterPromotionToDate;
}
