package com.emenu.features.order.dto.response;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Pricing and costs breakdown for an order with audit trail
 * Shows before/after snapshots for complete audit trail of all pricing changes
 * Includes: item-level discounts, order-level discounts, delivery fees, taxes
 * Uses consistent field naming across all pricing snapshots
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPricingInfo {
    // ===== AUDIT TRAIL: Before/After snapshots =====
    // Snapshot BEFORE any order-level modifications (after item-level pricing)
    @Valid
    private OrderPricingSnapshot before;

    // Was the order total modified from POS? (order-level discount applied)
    private Boolean hadOrderLevelChangeFromPOS;

    // Snapshot AFTER order-level modifications
    @Valid
    private OrderPricingSnapshot after;

    // Reason for change (POS order-level modifications)
    private String reason;
}

