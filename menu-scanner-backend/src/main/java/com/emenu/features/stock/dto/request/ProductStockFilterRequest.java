package com.emenu.features.stock.dto.request;

import com.emenu.shared.dto.BaseFilterRequest;
import com.emenu.enums.product.ProductStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
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

    // Stock Status Filters
    private ProductStatus status;
    private Boolean isExpired;
    private Boolean isOutOfStock;

    // Stock Level Filters
    private Integer minQuantity;
    private Integer maxQuantity;
    private Integer lowStockThreshold;  // Products with quantity < this threshold

    // Price Filters
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Expiry Date Filters
    private LocalDate expiryDateFrom;
    private LocalDate expiryDateTo;
}
