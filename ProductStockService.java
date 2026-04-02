package com.emenu.features.stock.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.emenu.features.stock.dto.request.ProductStockItemsFilterRequest;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
import com.emenu.features.stock.dto.response.ApiResponse;
import com.emenu.features.stock.repository.ProductStockItemRepository;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductStockService {

    private final ProductStockItemRepository repository;

    /**
     * Get all stock items with pagination
     * Returns complete product details for sales preview
     */
    public ApiResponse<Page<ProductStockItemDto>> getAllStockItems(
        UUID businessId,
        ProductStockItemsFilterRequest filter,
        int pageNo,
        int pageSize) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);
        Page<ProductStockItemDto> items = repository.findAllStockItems(businessId, pageable);

        return ApiResponse.success("Product stock items retrieved", items);
    }

    /**
     * Get all stock items without pagination
     * Useful for reports, exports, and bulk operations
     */
    public ApiResponse<List<ProductStockItemDto>> getAllStockItemsWithoutPagination(
        UUID businessId,
        ProductStockItemsFilterRequest filter) {

        List<ProductStockItemDto> items = repository.findAllStockItemsWithoutPagination(businessId);

        return ApiResponse.success("Product stock items retrieved", items);
    }
}
