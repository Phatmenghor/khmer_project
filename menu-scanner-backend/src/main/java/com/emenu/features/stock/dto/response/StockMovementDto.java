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

    private UUID orderId;
    private BigDecimal unitPrice;
    private BigDecimal costImpact;
    private String notes;

    private LocalDateTime createdAt;
}
