package com.emenu.features.stock.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "stock_alerts",
    indexes = {
        @Index(name = "idx_stock_alerts_business", columnList = "business_id"),
        @Index(name = "idx_stock_alerts_status", columnList = "status"),
        @Index(name = "idx_stock_alerts_type", columnList = "alert_type"),
        @Index(name = "idx_stock_alerts_product_stock", columnList = "product_stock_id"),
        @Index(name = "idx_stock_alerts_created", columnList = "created_at DESC"),
        @Index(name = "idx_stock_alerts_business_status", columnList = "business_id,status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID businessId;

    @Column(nullable = false)
    private UUID productStockId;

    @Column(nullable = false)
    private String alertType; // LOW_STOCK, OUT_OF_STOCK, EXPIRING_SOON, EXPIRED, NEGATIVE_STOCK, PRICE_ALERT, REORDER_DUE

    // ========== Product Info (Snapshot) ==========
    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = true)
    private UUID productSizeId;

    @Column(nullable = true)
    private String productName;

    @Column(nullable = true)
    private Integer currentQuantity;

    @Column(nullable = true)
    private Integer threshold;

    // ========== Expiry Info ==========
    @Column(nullable = true)
    private LocalDateTime expiryDate;

    @Column(nullable = true)
    private Integer daysUntilExpiry;

    // ========== Status & Handling ==========
    @Column(nullable = false)
    private String status; // ACTIVE, ACKNOWLEDGED, RESOLVED

    @Column(nullable = true)
    private UUID acknowledgedBy;

    @Column(nullable = true)
    private LocalDateTime acknowledgedAt;

    @Column(nullable = true)
    private LocalDateTime resolvedAt;

    // ========== Notification Status ==========
    @Column(nullable = false)
    private Boolean notificationSent;

    @Column(nullable = true)
    private String notificationType; // NONE, LOG, EMAIL, SMS, PUSH

    // ========== Audit ==========
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
        if (notificationSent == null) {
            notificationSent = false;
        }
        if (notificationType == null) {
            notificationType = "NONE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ========== Calculated Methods ==========
    public Boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public Boolean isResolved() {
        return "RESOLVED".equals(status);
    }

    public Boolean isAcknowledged() {
        return "ACKNOWLEDGED".equals(status);
    }

    public String getDisplayType() {
        return switch (alertType) {
            case "LOW_STOCK" -> "Low Stock";
            case "OUT_OF_STOCK" -> "Out of Stock";
            case "EXPIRING_SOON" -> "Expiring Soon";
            case "EXPIRED" -> "Expired";
            case "NEGATIVE_STOCK" -> "Negative Stock";
            case "PRICE_ALERT" -> "Price Alert";
            case "REORDER_DUE" -> "Reorder Due";
            default -> alertType;
        };
    }

    public String getSeverity() {
        return switch (alertType) {
            case "EXPIRED", "OUT_OF_STOCK", "NEGATIVE_STOCK" -> "CRITICAL";
            case "LOW_STOCK", "EXPIRING_SOON" -> "WARNING";
            case "REORDER_DUE" -> "INFO";
            default -> "INFO";
        };
    }
}
