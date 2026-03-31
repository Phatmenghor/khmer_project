package com.emenu.features.main.dto.filter;

import com.emenu.enums.product.ProductStatus;
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
    private String status; // Single status filter from frontend (ACTIVE, INACTIVE, OUT_OF_STOCK)
    private List<ProductStatus> statuses; // Multiple statuses (kept for backward compatibility)
    private Boolean hasPromotion;
    private Boolean hasSize; // Filter by products with/without sizes
    private String stockStatus; // Filter by stock status (ENABLED/DISABLED) - accepts string from frontend
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    /**
     * Convert single status to statuses list if needed
     * This allows the service to work with either field
     */
    public List<ProductStatus> getStatusList() {
        // If statuses is already set, use it
        if (statuses != null && !statuses.isEmpty()) {
            return statuses;
        }
        // If single status is set, convert to list
        if (status != null && !status.isEmpty()) {
            try {
                return List.of(ProductStatus.valueOf(status));
            } catch (IllegalArgumentException e) {
                // Invalid status, return null
                return null;
            }
        }
        return null;
    }
}