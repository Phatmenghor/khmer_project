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

    ProductStockDto createProductStock(ProductStockCreateRequest request);

    PaginationResponse<ProductStockDto> getAllProductStocks(ProductStockFilterRequest request);

    PaginationResponse<ProductStockItemDto> getAllProductStockItems(ProductStockFilterRequest request);

    PaginationResponse<ProductStockItemDto> getProductStockItems(ProductStockItemsFilterRequest request);

    ProductStockDto getProductStockById(UUID productStockId);

    ProductStockDto updateProductStock(UUID productStockId, ProductStockUpdateRequest request);

    void deleteProductStock(UUID productStockId);
}

