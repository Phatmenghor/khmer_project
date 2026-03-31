package com.emenu.features.main.dto.filter;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.shared.dto.BaseFilterRequest;
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
    private List<ProductStatus> statuses;
    private Boolean hasPromotion;
    private Boolean hasSize;
    private List<StockStatus> stockStatuses;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}