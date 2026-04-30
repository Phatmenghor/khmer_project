package com.emenu.features.order.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderItemResponse {
    private UUID id;

    // Product info grouped for easy identification
    private OrderItemProductInfo product;

    // Pricing
    private Integer quantity;
    private BigDecimal currentPrice;        // Base price before promotion
    private BigDecimal finalPrice;          // Price after promotion discount
    private BigDecimal totalPrice;

    // Promotion details snapshot
    private Boolean hasPromotion;
    private String promotionType;           // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    // Customizations
    private List<CustomizationDetail> customizations;  // Full customization details
    private BigDecimal customizationTotal;             // Total cost of customizations for this item

    @Data
    public static class OrderItemProductInfo {
        private UUID id;
        private String name;
        private String imageUrl;
        private String sku;
        private String barcode;
        private UUID sizeId;
        private String sizeName;
        private String status;
    }

    @Data
    public static class CustomizationDetail {
        private UUID productCustomizationId;
        private String name;
        private BigDecimal priceAdjustment;
    }
}
