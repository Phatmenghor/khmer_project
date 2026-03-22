package com.emenu.features.stock.dto.response;

import lombok.*;
import com.emenu.enums.product.ProductStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockDto {

    private UUID id;
    private UUID businessId;
    private UUID productId;
    private UUID productSizeId;

    // Stock Quantities
    private Integer quantityOnHand;
    private Integer quantityReserved;
    private Integer quantityAvailable;

    // Stock Thresholds
    private Integer minimumStockLevel;
    private Integer reorderQuantity;

    // Pricing
    private BigDecimal priceIn;
    private BigDecimal priceOut;
    private BigDecimal costPerUnit;
    private BigDecimal profitMargin; // (priceOut - priceIn) / priceIn * 100

    // Dates & Tracking
    private LocalDateTime dateIn;
    private LocalDateTime dateOut;
    private LocalDate expiryDate;
    private Integer daysUntilExpiry;

    // Identifiers
    private String barcode;
    private String sku;
    private String location;

    // Status Flags
    private ProductStatus status;
    private Boolean isExpired;
    private Boolean trackInventory;

    // Calculated Fields
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private Boolean isOverSold;

    // Financial Summary
    private BigDecimal inventoryValue;
    private BigDecimal retailValue;
    private BigDecimal potentialProfit;

    // Reorder Info
    private Integer unitsToReorder;

    // Product Info (Optional)
    private String productName;
    private String sizeName;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
