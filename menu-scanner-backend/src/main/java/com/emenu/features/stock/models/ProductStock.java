package com.emenu.features.stock.models;

import jakarta.persistence.*;
import lombok.*;
import com.emenu.enums.product.ProductStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "product_stock",
    indexes = {
        @Index(name = "idx_product_stock_business_id", columnList = "business_id"),
        @Index(name = "idx_product_stock_product_id", columnList = "product_id"),
        @Index(name = "idx_product_stock_barcode", columnList = "barcode"),
        @Index(name = "idx_product_stock_is_expired", columnList = "is_expired"),
        @Index(name = "idx_product_stock_low_stock", columnList = "quantity_on_hand"),
        @Index(name = "idx_product_stock_expiry", columnList = "expiry_date")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "product_stock_unique_variant",
            columnNames = {"product_id", "product_size_id", "business_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID businessId;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = true)
    private UUID productSizeId;

    // ========== Stock Quantities ==========
    @Column(nullable = false)
    private Integer quantityOnHand;

    @Column(nullable = false)
    private Integer quantityReserved;

    @Column(nullable = false)
    private Integer quantityAvailable;

    // ========== Stock Thresholds ==========
    @Column(nullable = false)
    private Integer minimumStockLevel;

    @Column(nullable = false)
    private Integer reorderQuantity;

    // ========== Pricing ==========
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal priceIn; // Cost price

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal priceOut; // Selling price

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal costPerUnit;

    // ========== Dates & Tracking ==========
    @Column(nullable = true)
    private LocalDateTime dateIn;

    @Column(nullable = true)
    private LocalDateTime dateOut;

    @Column(nullable = true)
    private LocalDate expiryDate;

    // ========== Identifiers ==========
    @Column(nullable = true, unique = true)
    private String barcode;

    @Column(nullable = true)
    private String sku;

    @Column(nullable = true)
    private String location;

    // ========== Status Flags ==========
    @Enumerated(EnumType.STRING)
    @Column(nullable = true, columnDefinition = "varchar(50) default 'ACTIVE'")
    private ProductStatus status;

    @Column(nullable = false)
    private Boolean isExpired;

    @Column(nullable = false)
    private Boolean trackInventory;

    // ========== Audit ==========
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = true)
    private UUID createdBy;

    @Column(nullable = true)
    private UUID updatedBy;

    // ========== Calculated Methods ==========
    public Boolean isLowStock() {
        return quantityOnHand <= minimumStockLevel;
    }

    public Boolean isOutOfStock() {
        return quantityOnHand <= 0;
    }

    public Boolean isOverSold() {
        return quantityOnHand < 0;
    }

    public BigDecimal getInventoryValue() {
        return priceIn.multiply(BigDecimal.valueOf(quantityOnHand));
    }

    public BigDecimal getRetailValue() {
        return priceOut.multiply(BigDecimal.valueOf(quantityOnHand));
    }

    public BigDecimal getPotentialProfit() {
        return getRetailValue().subtract(getInventoryValue());
    }

    public Integer getUnitsToReorder() {
        return Math.max(0, minimumStockLevel - quantityOnHand + reorderQuantity);
    }

    public Integer getDaysUntilExpiry() {
        if (expiryDate == null) return null;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quantityOnHand == null) quantityOnHand = 0;
        if (quantityReserved == null) quantityReserved = 0;
        if (quantityAvailable == null) quantityAvailable = 0;
        if (status == null) status = ProductStatus.ACTIVE;
        if (trackInventory == null) trackInventory = true;
        updateQuantityAvailable();
        checkExpiry();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateQuantityAvailable();
        checkExpiry();
    }

    private void updateQuantityAvailable() {
        quantityAvailable = Math.max(0, quantityOnHand - quantityReserved);
    }

    private void checkExpiry() {
        if (expiryDate != null) {
            isExpired = expiryDate.isBefore(LocalDate.now());
        }
    }
}
