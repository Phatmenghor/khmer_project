package com.emenu.features.order.dto.response;

import com.emenu.shared.enums.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Metadata for order-level discounts applied via POS system
 * Tracks complete before/after audit trail of discount application
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderLevelDiscountMetadata {
    // Type of discount: FIXED_AMOUNT or PERCENTAGE
    private DiscountType discountType;

    // Discount value: $ amount or % value
    private BigDecimal discountValue;

    // Total BEFORE discount was applied
    private BigDecimal beforeTotal;

    // Total AFTER discount was applied
    private BigDecimal afterTotal;

    // Amount saved = beforeTotal - afterTotal
    private BigDecimal amountSaved;

    // Human-readable reason for discount
    private String reason;

    // Timestamp of when discount was applied
    private LocalDateTime appliedAt;
}
