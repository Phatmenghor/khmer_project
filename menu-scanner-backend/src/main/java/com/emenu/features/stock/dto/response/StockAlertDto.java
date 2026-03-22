package com.emenu.features.stock.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlertDto {

    private UUID id;
    private UUID businessId;
    private UUID productStockId;

    private String alertType;
    private UUID productId;
    private UUID productSizeId;
    private String productName;

    private Integer currentQuantity;
    private Integer threshold;

    private LocalDateTime expiryDate;
    private Integer daysUntilExpiry;

    private String status;
    private UUID acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;

    private Boolean notificationSent;
    private String notificationType;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Display values
    private String displayType;
    private String severity;
}
