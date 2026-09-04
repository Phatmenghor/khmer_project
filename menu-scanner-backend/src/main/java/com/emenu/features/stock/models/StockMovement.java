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
    private String movementType; // STOCK_IN, STOCK_OUT, ADJUSTMENT, RETURN

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "unit_price", precision = 19, scale = 4)
    private BigDecimal unitPrice; // Cost price per unit (priceIn)

    @Column(name = "cost_impact", precision = 19, scale = 4)
    private BigDecimal costImpact; // Total COGS = quantityChange * unitPrice

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public String getDisplayType() {
        return switch (movementType) {
            case "STOCK_IN" -> "Stock In (Received)";
            case "STOCK_OUT" -> "Stock Out (Sold)";
            case "ADJUSTMENT" -> "Adjustment";
            case "RETURN" -> "Return";
            default -> movementType;
        };
    }

    @Override
    public void prePersist() {
        super.prePersist();
        if (costImpact == null) costImpact = BigDecimal.ZERO;
        if (unitPrice == null) unitPrice = BigDecimal.ZERO;
    }
}
