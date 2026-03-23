package com.emenu.features.stock.dto.request;

import com.emenu.shared.dto.BaseFilterRequest;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementFilterRequest extends BaseFilterRequest {

    private UUID businessId;
    private UUID productId;
    private UUID productStockId;

    // Filter by movement type: STOCK_IN | STOCK_OUT | ADJUSTMENT | RETURN | DAMAGE | EXPIRY | STOCK_CHECK
    private String movementType;

    private LocalDateTime fromDate;
    private LocalDateTime toDate;
}
