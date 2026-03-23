package com.emenu.features.stock.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_alerts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class StockAlert extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "product_stock_id", nullable = false)
    private UUID productStockId;

    @Column(name = "alert_type", nullable = false)
    private String alertType; // LOW_STOCK, OUT_OF_STOCK, EXPIRING_SOON, EXPIRED, NEGATIVE_STOCK

    // ========== Product Info ==========
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_size_id")
    private UUID productSizeId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "current_quantity")
    private Integer currentQuantity;

    @Column(name = "threshold")
    private Integer threshold;

    // ========== Expiry Info ==========
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "days_until_expiry")
    private Integer daysUntilExpiry;

    // ========== Status & Handling ==========
    @Column(name = "status", nullable = false)
    private String status; // ACTIVE, ACKNOWLEDGED, RESOLVED

    @Column(name = "acknowledged_by")
    private UUID acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // ========== Notification Status ==========
    @Column(name = "notification_sent", nullable = false)
    private Boolean notificationSent;

    @Column(name = "notification_type")
    private String notificationType; // NONE, LOG, EMAIL, SMS, PUSH

    // ========== Calculated Methods ==========
    public String getDisplayType() {
        return switch (alertType) {
            case "LOW_STOCK" -> "Low Stock";
            case "OUT_OF_STOCK" -> "Out of Stock";
            case "EXPIRING_SOON" -> "Expiring Soon";
            case "EXPIRED" -> "Expired";
            case "NEGATIVE_STOCK" -> "Negative Stock";
            default -> alertType;
        };
    }

    public String getSeverity() {
        return switch (alertType) {
            case "EXPIRED", "OUT_OF_STOCK", "NEGATIVE_STOCK" -> "CRITICAL";
            case "LOW_STOCK", "EXPIRING_SOON" -> "WARNING";
            default -> "INFO";
        };
    }

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist();
        if (status == null) status = "ACTIVE";
        if (notificationSent == null) notificationSent = false;
        if (notificationType == null) notificationType = "NONE";
    }
}
