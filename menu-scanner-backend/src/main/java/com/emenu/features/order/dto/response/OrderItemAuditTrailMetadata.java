package com.emenu.features.order.dto.response;

import com.emenu.shared.enums.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Metadata for item-level changes in POS system
 * Tracks complete audit trail of what changed and why
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemAuditTrailMetadata {
    // Type of change: PRICE_OVERRIDE, PROMOTION_APPLIED, QUANTITY_CHANGED, COMBINED
    private ChangeType changeType;

    // Type of discount applied: FIXED_AMOUNT or PERCENTAGE
    private DiscountType discountType;

    // Discount value: $ amount or % value
    private BigDecimal discountValue;

    // Original price before any changes
    private BigDecimal originalPrice;

    // Updated/final price after all changes
    private BigDecimal updatedPrice;

    // Human-readable reason
    private String reason;

    // Timestamp of change
    private LocalDateTime changedAt;

    // Change type enumeration
    public enum ChangeType {
        PRICE_OVERRIDE,        // Admin changed base price
        PROMOTION_APPLIED,     // Promotion was added/modified
        QUANTITY_CHANGED,      // Quantity was modified
        COMBINED               // Multiple changes
    }
}
