package com.emenu.features.stock.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementDto {

    private UUID id;
    private UUID businessId;
    private UUID productStockId;

    private String movementType;
    private Integer quantityChange;
    private Integer previousQuantity;
    private Integer newQuantity;

    private String referenceType;
    private UUID referenceId;
    private UUID orderId;
    private UUID orderItemId;

    private String notes;
    private UUID initiatedBy;
    private String initiatedByName;
    private UUID approvedBy;

    private BigDecimal costImpact;
    private BigDecimal unitPrice;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Display values
    private String displayType;
}
