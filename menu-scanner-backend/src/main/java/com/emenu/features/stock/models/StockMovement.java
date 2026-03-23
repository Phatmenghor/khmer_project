package com.emenu.features.stock.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "product_stock_id", nullable = false)
    private UUID productStockId;

    @Column(name = "movement_type", nullable = false)
    private String movementType; // STOCK_IN, STOCK_OUT, ADJUSTMENT, RETURN, DAMAGE, EXPIRY, STOCK_CHECK

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;

    // ========== Reference Tracking ==========
    @Column(name = "reference_type")
    private String referenceType; // ORDER, ADJUSTMENT, RETURN

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "order_id")
    private UUID orderId;

    // ========== Notes & People ==========
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "initiated_by")
    private UUID initiatedBy;

    @Column(name = "initiated_by_name")
    private String initiatedByName;

    // ========== Financial Impact ==========
    @Column(name = "cost_impact", precision = 19, scale = 4)
    private BigDecimal costImpact;

    @Column(name = "unit_price", precision = 19, scale = 4)
    private BigDecimal unitPrice;

    // ========== Calculated Methods ==========
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

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist();
        if (costImpact == null) costImpact = BigDecimal.ZERO;
        if (unitPrice == null) unitPrice = BigDecimal.ZERO;
    }
}
