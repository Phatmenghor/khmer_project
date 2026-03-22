package com.emenu.features.stock.dto.request;

import com.emenu.shared.dto.BaseFilterRequest;
import com.emenu.enums.product.ProductStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockFilterRequest extends BaseFilterRequest {

    private UUID businessId;
    private UUID productId;
    private UUID productSizeId;

    private ProductStatus status;

    // When set, returns stocks with quantityOnHand < lowStockThreshold (e.g. 3 = quantity < 3)
    private Integer lowStockThreshold;

    // When set, returns stocks whose expiryDate <= this datetime (e.g. now+7days = expiring within 7 days)
    private LocalDateTime expiredBefore;
}
