package com.emenu.features.stock.dto.response;

import lombok.*;
import com.emenu.enums.product.ProductStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockItemDto {

    // ========== IDENTITY ==========
    /** Unique ID of this stock item */
    private UUID id;

    /** ID of the product this stock belongs to */
    private UUID productId;

    /** ID of the product size variant (null if product has no sizes) */
    private UUID productSizeId;

    // ========== PRODUCT INFORMATION ==========
    /** Display name of the product */
    private String productName;

    /** Product description for sales preview */
    private String description;

    /** Category unique ID */
    private UUID categoryId;

    /** Category display name */
    private String categoryName;

    /** Brand unique ID */
    private UUID brandId;

    /** Brand display name */
    private String brandName;

    /** Product status (ACTIVE/INACTIVE) */
    private ProductStatus status;

    // ========== IDENTIFICATION CODES (CRITICAL) ==========
    /** Stock Keeping Unit - MUST NOT BE NULL */
    private String sku;

    /** Product barcode - MUST NOT BE NULL */
    private String barcode;

    // ========== SIZE INFORMATION ==========
    /** Display name of the size variant (null if product has no sizes) */
    private String sizeName;

    // ========== PRICING & PROMOTIONS ==========
    /** Base selling price (as string for decimal precision) */
    private String price;

    /** Final display price after discount */
    private BigDecimal displayPrice;

    /** Promotion type (PERCENTAGE or FIXED_AMOUNT) */
    private String displayPromotionType;

    /** Discount value (percentage or fixed amount) */
    private BigDecimal displayPromotionValue;

    /** Promotion valid from date/time (ISO datetime) */
    private LocalDateTime displayPromotionFromDate;

    /** Promotion valid to date/time (ISO datetime) */
    private LocalDateTime displayPromotionToDate;

    /** Flag indicating if item is on promotion */
    private Boolean hasPromotion;

    // ========== INVENTORY INFORMATION ==========
    /** Total quantity in stock */
    private Integer totalStock;

    /** Quantity available for sale (totalStock - reserved) */
    private Integer quantityAvailable;

    /** Quantity already reserved/ordered */
    private Integer quantityReserved;

    /** Physical units in hand */
    private Integer quantityOnHand;

    // ========== STOCK STATUS ==========
    /** Stock tracking status (ENABLED/DISABLED) */
    private String stockStatus;

    // ========== ITEM TYPE ==========
    /** Type of item (PRODUCT or SIZE) */
    private String type;

    // ========== PRODUCT IMAGES ==========
    /** Main product image URL */
    private String mainImageUrl;

    /** Product images gallery */
    private List<ProductImageDto> images;

    // ========== ENGAGEMENT METRICS ==========
    /** Total number of product views */
    private Integer viewCount;

    /** Total number of times favorited */
    private Integer favoriteCount;

    // ========== METADATA ==========
    /** Timestamp when this stock item was created */
    private LocalDateTime createdAt;

    /** Timestamp when this stock item was last updated */
    private LocalDateTime updatedAt;


    // ========== INNER DTO FOR IMAGES ==========
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductImageDto {
        /** Image unique ID */
        private UUID id;

        /** Image URL (absolute URL) */
        private String imageUrl;

        /** Display order in gallery */
        private Integer displayOrder;
    }
}
