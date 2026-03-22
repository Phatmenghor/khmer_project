package com.emenu.features.stock.dto.response;

import lombok.*;
import com.emenu.enums.product.ProductStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockDto {

    // ========== Identity ==========

    /** Unique ID of this stock record */
    private UUID id;

    /** ID of the business that owns this stock */
    private UUID businessId;

    /** ID of the product this stock belongs to */
    private UUID productId;

    /** ID of the product size variant (null if product has no sizes) */
    private UUID productSizeId;

    // ========== Product Info ==========

    /** Display name of the product */
    private String productName;

    /** Display name of the size variant (null if product has no sizes) */
    private String sizeName;

    // ========== Stock Quantities ==========

    /** Total physical units currently in stock */
    private Integer quantityOnHand;

    /** Units reserved for pending orders (not yet fulfilled) */
    private Integer quantityReserved;

    /** Units available to sell = quantityOnHand - quantityReserved */
    private Integer quantityAvailable;

    /** Alert threshold — triggers low-stock warning when quantityOnHand <= this value */
    private Integer minimumStockLevel;

    // ========== Pricing ==========

    /** Cost price — how much you paid per unit (buying price) */
    private BigDecimal priceIn;

    /** Selling price — how much customers pay per unit */
    private BigDecimal priceOut;

    /** Cost per unit (defaults to priceIn if not set separately) */
    private BigDecimal costPerUnit;

    /** Profit margin percentage = (priceOut - priceIn) / priceIn × 100 */
    private BigDecimal profitMargin;

    // ========== Dates ==========

    /** Date and time when this stock batch was received */
    private LocalDateTime dateIn;

    /** Expiry date/time of this stock batch (null if product does not expire) */
    private LocalDateTime expiryDate;

    // ========== Identifiers ==========

    /** Barcode for scanning this stock item */
    private String barcode;

    /** Internal SKU code for inventory management */
    private String sku;

    /** Physical storage location (e.g. "Shelf A1", "Warehouse B") */
    private String location;

    // ========== Status ==========

    /** Current status of this stock record (ACTIVE, INACTIVE, EXPIRED) */
    private ProductStatus status;

    /** True if the stock has passed its expiry date */
    private Boolean isExpired;

    /** Whether inventory quantity is being tracked for this item */
    private Boolean trackInventory;

    // ========== Stock Status Flags ==========

    /** True when quantityOnHand <= minimumStockLevel — needs restocking */
    private Boolean isLowStock;

    /** True when quantityOnHand <= 0 — completely out of stock */
    private Boolean isOutOfStock;

    // ========== Financial Summary ==========

    /** Total cost value of stock on hand = quantityOnHand × priceIn */
    private BigDecimal inventoryValue;

    /** Total retail value of stock on hand = quantityOnHand × priceOut */
    private BigDecimal retailValue;

    /** Potential profit if all stock is sold = retailValue - inventoryValue */
    private BigDecimal potentialProfit;

    // ========== Audit ==========

    /** Timestamp when this stock record was created */
    private LocalDateTime createdAt;

    /** Timestamp when this stock record was last updated */
    private LocalDateTime updatedAt;
}
