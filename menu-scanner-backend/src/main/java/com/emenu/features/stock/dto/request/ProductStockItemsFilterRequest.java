package com.emenu.features.stock.dto.request;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.util.UUID;

/**
 * Type-safe request DTO for product stock items listing with filtering and sorting.
 * Provides sensible defaults and easy-to-understand field names.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockItemsFilterRequest {

    // Pagination
    @Min(value = 1, message = "Page number must be at least 1")
    @Builder.Default
    private Integer pageNo = 1;

    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 101, message = "Page size cannot exceed 101")
    @Builder.Default
    private Integer pageSize = 15;

    // Sorting - easy field names
    @Builder.Default
    private String sortBy = "totalStock";  // Options: totalStock, productName, sku, barcode, status, stockStatus, sizeName, createdAt, updatedAt

    @Builder.Default
    private String sortDirection = "DESC";  // ASC for low to high, DESC for high to low

    // Filtering
    private UUID businessId;

    @Builder.Default
    private String search = "";  // Search by product name

    private ProductStatus status;  // ACTIVE, INACTIVE

    private StockStatus stockStatus;  // ENABLED, DISABLED

    private Integer lowStockThreshold;  // Returns items with stock < threshold

    // Filter by product sizes: true = only products with sizes, false = only products without sizes, null = all
    private Boolean hasSizes;
}
