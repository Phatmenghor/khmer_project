package com.emenu.features.stock.dto.request;

import com.emenu.shared.dto.BaseFilterRequest;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlertFilterRequest extends BaseFilterRequest {

    private UUID businessId;
    private UUID productId;

    // Filter by alert type: LOW_STOCK | OUT_OF_STOCK | EXPIRING_SOON | EXPIRED | NEGATIVE_STOCK | PRICE_ALERT | REORDER_DUE
    private String alertType;

    // Filter by status: ACTIVE | ACKNOWLEDGED | RESOLVED
    private String status;
}
