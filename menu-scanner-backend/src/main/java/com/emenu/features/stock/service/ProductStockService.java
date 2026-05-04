package com.emenu.features.stock.service;

import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockItemsFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
import com.emenu.shared.dto.PaginationResponse;
import java.util.UUID;

public interface ProductStockService {

    /**
     * Create a new product stock
     */
    ProductStockDto createProductStock(ProductStockCreateRequest request);

    /**
     * Get all product stocks with pagination and filters
     */
    PaginationResponse<ProductStockDto> getAllProductStocks(ProductStockFilterRequest request);

    /**
     * Get all product stock items (products with sizes as flat list)
     * Each product or product-size is one item in the list
     */
    PaginationResponse<ProductStockItemDto> getAllProductStockItems(ProductStockFilterRequest request);

    /**
     * Get product stock items with type-safe filtering and sorting.
     * Easy field names and smart defaults (sortBy=totalStock, direction=DESC).
     * Supports filters: status, stockStatus, lowStockThreshold, hasSizes
     */
    PaginationResponse<ProductStockItemDto> getProductStockItems(ProductStockItemsFilterRequest request);

    /**
     * Get product stock by ID
     */
    ProductStockDto getProductStockById(UUID productStockId);

    /**
     * Update product stock
     */
    ProductStockDto updateProductStock(UUID productStockId, ProductStockUpdateRequest request);

    /**
     * Delete product stock
     */
    void deleteProductStock(UUID productStockId);
}
