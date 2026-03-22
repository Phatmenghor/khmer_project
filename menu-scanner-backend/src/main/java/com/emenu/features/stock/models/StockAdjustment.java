package com.emenu.features.stock.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "stock_adjustments",
    indexes = {
        @Index(name = "idx_stock_adjustments_business", columnList = "business_id"),
        @Index(name = "idx_stock_adjustments_product_stock", columnList = "product_stock_id"),
        @Index(name = "idx_stock_adjustments_requires_approval", columnList = "requires_approval,approved"),
        @Index(name = "idx_stock_adjustments_adjusted_at", columnList = "adjusted_at DESC")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID businessId;

    @Column(nullable = false)
    private UUID productStockId;

    @Column(nullable = false)
    private String adjustmentType; // RECOUNT, RECEIVED, DAMAGED, LOST, CORRECTION

    @Column(nullable = false)
    private Integer previousQuantity;

    @Column(nullable = false)
    private Integer adjustedQuantity;

    @Column(nullable = false)
    private Integer quantityDifference;

    @Column(nullable = false)
    private Boolean requiresApproval;

    @Column(nullable = false)
    private Boolean approved;

    @Column(nullable = true)
    private UUID approvedBy;

    @Column(nullable = true)
    private LocalDateTime approvedAt;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String detailNotes;

    @Column(nullable = false)
    private UUID adjustedBy;

    @Column(nullable = false)
    private LocalDateTime adjustedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (adjustedAt == null) {
            adjustedAt = LocalDateTime.now();
        }
        if (requiresApproval == null) {
            requiresApproval = false;
        }
        if (approved == null) {
            approved = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Boolean isPending() {
        return requiresApproval && !approved;
    }

    public Boolean canApprove() {
        return requiresApproval && !approved;
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
