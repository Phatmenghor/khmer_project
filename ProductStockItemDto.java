package com.emenu.features.stock.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Complete Sales Preview DTO for Stock Items
 * Contains all fields needed for the Stock Items page detail modal
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockItemDto {

    // ========== IDENTITY ==========
    private UUID id;
    private UUID productId;

    // ========== PRODUCT INFO ==========
    private String productName;
    private String description;
    private String sku;              // CRITICAL: Never null
    private String barcode;          // CRITICAL: Never null

    // ========== CATEGORY & BRAND ==========
    private UUID categoryId;
    private String categoryName;
    private UUID brandId;
    private String brandName;

    // ========== PRICING & PROMOTIONS ==========
    private String price;                       // Base selling price
    private BigDecimal displayPrice;            // Final price after discount
    private String displayPromotionType;        // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal displayPromotionValue;   // Discount value
    private LocalDateTime displayPromotionFromDate;  // Promotion start date
    private LocalDateTime displayPromotionToDate;    // Promotion end date
    private Boolean hasPromotion;               // Is on promotion

    // ========== INVENTORY ==========
    private Integer totalStock;        // Total quantity
    private Integer quantityAvailable; // Available = total - reserved
    private Integer quantityReserved;  // Already reserved
    private Integer quantityOnHand;    // Physical quantity

    // ========== IMAGES ==========
    private String mainImageUrl;       // Main product image

    // ========== METADATA ==========
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
