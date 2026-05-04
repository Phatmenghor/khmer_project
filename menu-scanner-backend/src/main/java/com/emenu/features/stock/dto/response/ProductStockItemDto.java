package com.emenu.features.stock.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Complete Sales Preview DTO for product stock items listing
 * Represents a product or product-size with aggregated stock information
 * Includes pricing, promotions, inventory details, and product information
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
    private UUID productSizeId;

    // ========== PRODUCT INFO ==========
    private String productName;
    private String description;                    // NEW: Product description

    // ========== CATEGORY & BRAND ==========
    private UUID categoryId;                       // NEW: Category ID
    private String categoryName;
    private UUID brandId;                          // NEW: Brand ID
    private String brandName;

    // ========== IDENTIFICATION CODES ==========
    private String sku;
    private String barcode;

    // ========== SIZE INFO ==========
    private String sizeName;                       // null for PRODUCT type

    // ========== PRICING & PROMOTIONS ==========
    private String price;                          // NEW: Base selling price
    private BigDecimal displayPrice;               // NEW: Final price after discount
    private String displayPromotionType;           // NEW: PERCENTAGE or FIXED_AMOUNT
    private BigDecimal displayPromotionValue;      // NEW: Discount value
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime displayPromotionFromDate; // NEW: Promotion start date
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime displayPromotionToDate;   // NEW: Promotion end date
    private Boolean hasPromotion;                  // NEW: Is on promotion flag

    // ========== INVENTORY ==========
    private Long totalStock;
    private Long quantityAvailable;                // NEW: Available = total - reserved
    private Long quantityReserved;                 // NEW: Already reserved
    private Long quantityOnHand;                   // NEW: Physical quantity

    // ========== STOCK STATUS ==========
    private String status;                         // Product status (ACTIVE, INACTIVE)
    private String stockStatus;                    // Stock status (ENABLED, DISABLED)

    // ========== ITEM TYPE ==========
    private String type;                           // PRODUCT or SIZE

    // ========== IMAGES ==========
    private String mainImageUrl;                   // NEW: Main product image

    // ========== METADATA ==========
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
