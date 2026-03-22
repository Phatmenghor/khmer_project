package com.emenu.features.stock.dto.request;

import com.emenu.shared.dto.BaseFilterRequest;
import com.emenu.enums.product.ProductStatus;
import lombok.*;
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
    private Boolean isExpired;
    private Boolean isOutOfStock;
}
