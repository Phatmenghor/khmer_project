package com.emenu.features.order.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

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

    // Admin override price (optional - if not provided, use product price)
    private BigDecimal overridePrice;

    // Promotion override (optional)
    private String promotionType; // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal promotionValue; // The discount amount or percentage

    private String productName;
    private String productImageUrl;
    private String sizeName;
}
