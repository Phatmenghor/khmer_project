package com.emenu.features.order.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    private UUID id;

    // Product information
    private UUID productId;
    private String productName;
    private String productImageUrl;
    private UUID productSizeId;
    private String sizeName;
    private String status;

    // SKU and barcode
    private String sku;
    private String barcode;

    // Pricing
    private BigDecimal currentPrice;
    private BigDecimal finalPrice;
    private Boolean hasPromotion;

    private Integer quantity;

    // Pricing breakdown
    private BigDecimal totalBeforeDiscount;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;

    // Promotion details
    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    // Customizations/Add-ons - matches POSCheckoutItemRequest
    private List<CustomizationDetail> customizations;

    // ─── Customization Detail Nested Class ───
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomizationDetail {
        private UUID productCustomizationId;
        private String name;
        private BigDecimal priceAdjustment;
    }
}

