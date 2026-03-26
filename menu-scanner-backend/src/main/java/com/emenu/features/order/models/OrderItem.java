package com.emenu.features.order.models;

import com.emenu.features.main.models.Product;
import com.emenu.features.main.models.ProductSize;
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
@Table(name = "order_items")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseUUIDEntity {

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "product_size_id")
    private UUID productSizeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_size_id", insertable = false, updatable = false)
    private ProductSize productSize;

    // Snapshot of product details at time of order
    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_image_url")
    private String productImageUrl;

    @Column(name = "size_name")
    private String sizeName; // "Standard" if no size

    // Pricing snapshot - preserves discount/promotion at time of order
    @Column(name = "current_price", precision = 10, scale = 2)
    private BigDecimal currentPrice; // Base price before discount

    @Column(name = "final_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice; // Price after discount (same as unitPrice for backward compat)

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice; // Price at time of order (same as finalPrice)

    @Column(name = "has_promotion")
    private Boolean hasPromotion;

    // Promotion details snapshot
    @Column(name = "promotion_type")
    private String promotionType; // PERCENTAGE or FIXED_AMOUNT

    @Column(name = "promotion_value", precision = 10, scale = 2)
    private BigDecimal promotionValue;

    @Column(name = "promotion_from_date")
    private LocalDateTime promotionFromDate;

    @Column(name = "promotion_to_date")
    private LocalDateTime promotionToDate;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice; // finalPrice * quantity

    // Customer instructions for this specific item
    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    // ===== AUDIT TRAIL: Before/After snapshots =====
    // Snapshot BEFORE any POS modifications (original product price) - DEPRECATED, use proper columns below
    @Column(name = "before_snapshot", columnDefinition = "TEXT")
    private String beforeSnapshot; // JSON: OrderItemPricingSnapshot

    // Was the item modified from POS?
    @Column(name = "had_change_from_pos")
    private Boolean hadChangeFromPOS = false;

    // Snapshot AFTER POS modifications - DEPRECATED, use proper columns below
    @Column(name = "after_snapshot", columnDefinition = "TEXT")
    private String afterSnapshot; // JSON: OrderItemPricingSnapshot

    // Detailed audit metadata (if changed) - DEPRECATED
    @Column(name = "audit_metadata", columnDefinition = "TEXT")
    private String auditMetadata; // JSON: OrderItemAuditTrailMetadata

    // Reason for the change (if any)
    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;

    // ===== NEW: Before Snapshot Fields (replacing JSON) =====
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
    private java.time.LocalDateTime beforePromotionFromDate;

    @Column(name = "before_promotion_to_date")
    private java.time.LocalDateTime beforePromotionToDate;

    // ===== NEW: After Snapshot Fields (replacing JSON) =====
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
    private java.time.LocalDateTime afterPromotionFromDate;

    @Column(name = "after_promotion_to_date")
    private java.time.LocalDateTime afterPromotionToDate;

    // Business Methods
    public void calculateTotalPrice() {
        this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }
}