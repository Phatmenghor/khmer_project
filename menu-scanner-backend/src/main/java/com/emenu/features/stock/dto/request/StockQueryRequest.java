package com.emenu.features.stock.dto.request;

import jakarta.validation.constraints.Min;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockQueryRequest {

    // Pagination
    @Min(value = 1, message = "Page must be at least 1")
    @Builder.Default
    private Integer pageNo = 1;

    @Min(value = 1, message = "Page size must be at least 1")
    @Builder.Default
    private Integer pageSize = 50;

    // Filters
    private UUID businessId;
    private UUID productId;
    private UUID productSizeId;

    private String searchText; // Search by product name, barcode, SKU

    private Boolean trackInventory;
    private Boolean isActive;
    private Boolean isExpired;

    // Quantity filters
    private Integer minQuantity;
    private Integer maxQuantity;
    private Boolean lowStockOnly; // quantity <= threshold

    // Price filters
    private Boolean lowProfitMargin; // price_out < price_in * 1.1

    // Expiry filters
    private LocalDate expiryDateFrom;
    private LocalDate expiryDateTo;
    private Boolean expiringWithinDays; // Expiring within X days (use searchDays)
    private Integer searchDays;

    // Sorting
    @Builder.Default
    private String sortBy = "createdAt"; // createdAt, quantityOnHand, priceOut, expiryDate
    @Builder.Default
    private String sortOrder = "DESC"; // ASC, DESC
}
