package com.emenu.features.stock.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_adjustments")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustment extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "product_stock_id", nullable = false)
    private UUID productStockId;

    @Column(name = "adjustment_type", nullable = false)
    private String adjustmentType; // RECOUNT, RECEIVED, DAMAGED, LOST, CORRECTION

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "adjusted_quantity", nullable = false)
    private Integer adjustedQuantity;

    @Column(name = "quantity_difference", nullable = false)
    private Integer quantityDifference;

    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval;

    @Column(name = "approved", nullable = false)
    private Boolean approved;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "detail_notes", columnDefinition = "TEXT")
    private String detailNotes;

    @Column(name = "adjusted_by", nullable = false)
    private UUID adjustedBy;

    @Column(name = "adjusted_at", nullable = false)
    private LocalDateTime adjustedAt;

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist();
        if (adjustedAt == null) adjustedAt = LocalDateTime.now();
        if (requiresApproval == null) requiresApproval = false;
        if (approved == null) approved = false;
    }

    public String getDisplayType() {
        return switch (adjustmentType) {
            case "RECOUNT" -> "Physical Recount";
            case "RECEIVED" -> "Stock Received";
            case "DAMAGED" -> "Damaged Goods";
            case "LOST" -> "Lost/Theft";
            case "CORRECTION" -> "Error Correction";
            default -> adjustmentType;
        };
    }
}
