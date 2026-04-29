package com.emenu.features.order.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Item in POS checkout with complete before/after audit trail
 * Captures: before snapshot → after snapshot with detailed metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class POSCheckoutItemRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    private UUID productSizeId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;

    // Display fields
    private String productName;
    private String productImageUrl;
    private String sizeName;
    private String status; // ACTIVE

    // SKU and barcode (optional - from request, fallback if not in product master data)
    private String sku;
    private String barcode;

    // Customizations/Add-ons - full details (only one field, not duplicate)
    private List<CustomizationDetail> customizations;  // Full details: id, productCustomizationId, name, priceAdjustment

    // Simplified Pricing
    private BigDecimal finalPrice;         // Price after promotions
    private BigDecimal totalPrice;         // quantity * finalPrice

    // ─── Customization Detail Nested Class ───
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomizationDetail {
        private UUID id;
        private UUID productCustomizationId;
        private String name;
        private BigDecimal priceAdjustment;
    }

}
