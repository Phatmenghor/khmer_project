package com.emenu.features.stock.service;

import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.shared.dto.PaginationResponse;
import java.util.UUID;

public interface ProductStockService {

    /**
     * Create a new product stock
     */
    ProductStockDto createProductStock(UUID businessId, ProductStockCreateRequest request);

    /**
     * Get all product stocks with pagination and filters
     */
    PaginationResponse<ProductStockDto> getAllProductStocks(ProductStockFilterRequest request);

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
