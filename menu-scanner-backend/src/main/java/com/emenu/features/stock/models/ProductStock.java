package com.emenu.features.stock.models;

import com.emenu.enums.product.ProductStatus;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_stock")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProductStock extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_size_id")
    private UUID productSizeId;

    // ========== Stock Quantities ==========
    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand;

    @Column(name = "quantity_reserved", nullable = false)
    private Integer quantityReserved;

    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable;

    // ========== Pricing (cost side only) ==========
    @Column(name = "price_in", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceIn;

    // ========== Dates & Tracking ==========
    @Column(name = "date_in")
    private LocalDateTime dateIn;

    @Column(name = "date_out")
    private LocalDateTime dateOut;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "location")
    private String location;

    // ========== Status Flags ==========
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProductStatus status;

    @Column(name = "is_expired", nullable = false)
    private Boolean isExpired;

    // ========== Calculated Methods ==========
    public Boolean isOutOfStock() {
        return quantityOnHand <= 0;
    }

    public BigDecimal getInventoryValue() {
        return priceIn.multiply(BigDecimal.valueOf(quantityOnHand));
    }

    public Integer getDaysUntilExpiry() {
        if (expiryDate == null) return null;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), expiryDate);
    }

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist();
        if (quantityOnHand == null) quantityOnHand = 0;
        if (quantityReserved == null) quantityReserved = 0;
        if (quantityAvailable == null) quantityAvailable = 0;
        if (status == null) status = ProductStatus.ACTIVE;
        if (isExpired == null) isExpired = false;
        updateQuantityAvailable();
        checkExpiry();
    }

    @PreUpdate
    @Override
    public void preUpdate() {
        super.preUpdate();
        updateQuantityAvailable();
        checkExpiry();
    }

    private void updateQuantityAvailable() {
        quantityAvailable = Math.max(0, quantityOnHand - quantityReserved);
    }

    private void checkExpiry() {
        if (expiryDate != null) {
            isExpired = expiryDate.isBefore(LocalDateTime.now());
        }
    }
}
