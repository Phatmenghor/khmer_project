package com.emenu.features.main.dto.filter;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.shared.dto.BaseFilterRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class ProductFilterDto extends BaseFilterRequest {
    private UUID businessId;
    private UUID categoryId;
    private UUID brandId;

    @Schema(
        description = "Filter by product status (ACTIVE, INACTIVE, ARCHIVED, etc.)",
        example = "[\"ACTIVE\"]"
    )
    private List<ProductStatus> statuses;

    private Boolean hasPromotion;

    @Schema(
        description = "Filter by products with or without sizes",
        example = "true"
    )
    private Boolean hasSize;

    @Schema(
        description = "Filter by stock status (ENABLED to show products with stock tracking enabled, DISABLED for stock tracking disabled)",
        example = "[\"ENABLED\"]"
    )
    private List<StockStatus> stockStatuses;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}