package com.emenu.features.stock.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "stock_movements",
    indexes = {
        @Index(name = "idx_stock_movements_business", columnList = "business_id"),
        @Index(name = "idx_stock_movements_product_stock", columnList = "product_stock_id"),
        @Index(name = "idx_stock_movements_type", columnList = "movement_type"),
        @Index(name = "idx_stock_movements_order", columnList = "order_id"),
        @Index(name = "idx_stock_movements_created", columnList = "created_at DESC"),
        @Index(name = "idx_stock_movements_business_created", columnList = "business_id,created_at DESC")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID businessId;

    @Column(nullable = false)
    private UUID productStockId;

    @Column(nullable = false)
    private String movementType; // STOCK_IN, STOCK_OUT, ADJUSTMENT, RETURN, DAMAGE, EXPIRY, STOCK_CHECK

    @Column(nullable = false)
    private Integer quantityChange;

    @Column(nullable = false)
    private Integer previousQuantity;

    @Column(nullable = false)
    private Integer newQuantity;

    // ========== Reference Tracking ==========
    @Column(nullable = true)
    private String referenceType; // ORDER, ADJUSTMENT, RETURN, INCIDENT

    @Column(nullable = true)
    private UUID referenceId;

    @Column(nullable = true)
    private UUID orderId;

    @Column(nullable = true)
    private UUID orderItemId;

    // ========== Notes & People ==========
    @Column(nullable = true, columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = true)
    private UUID initiatedBy;

    @Column(nullable = true)
    private String initiatedByName;

    @Column(nullable = true)
    private UUID approvedBy;

    // ========== Financial Impact ==========
    @Column(nullable = true, precision = 19, scale = 4)
    private BigDecimal costImpact;

    @Column(nullable = true, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    // ========== Audit ==========
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (costImpact == null) {
            costImpact = BigDecimal.ZERO;
        }
        if (unitPrice == null) {
            unitPrice = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ========== Calculated Methods ==========
    public Boolean isValid() {
        return newQuantity == (previousQuantity + quantityChange);
    }

    public String getDisplayType() {
        return switch (movementType) {
            case "STOCK_IN" -> "Stock In (Received)";
            case "STOCK_OUT" -> "Stock Out (Sold)";
            case "ADJUSTMENT" -> "Adjustment";
            case "RETURN" -> "Return";
            case "DAMAGE" -> "Damage/Loss";
            case "EXPIRY" -> "Expiry";
            case "STOCK_CHECK" -> "Physical Count";
            default -> movementType;
        };
    }
}
