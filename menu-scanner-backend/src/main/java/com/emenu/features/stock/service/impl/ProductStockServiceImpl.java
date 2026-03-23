package com.emenu.features.stock.service.impl;

import com.emenu.exception.custom.ValidationException;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.main.repository.ProductSizeRepository;
import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.mapper.ProductStockMapper;
import com.emenu.features.stock.models.ProductStock;
import com.emenu.features.stock.repository.ProductStockRepository;
import com.emenu.features.stock.service.ProductStockService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductStockServiceImpl implements ProductStockService {

    private final ProductStockRepository productStockRepository;
    private final ProductStockMapper productStockMapper;
    private final PaginationMapper paginationMapper;
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;

    @Override
    public ProductStockDto createProductStock(ProductStockCreateRequest request) {
        log.info("📝 CREATE - Business: {}, Product: {}, Qty: {}",
                request.getBusinessId(), request.getProductId(), request.getQuantityOnHand());

        ProductStock productStock = productStockMapper.toEntity(request);
        productStock.setBusinessId(request.getBusinessId());

        // Set dateIn to now on first creation
        productStock.setDateIn(LocalDateTime.now());

        // Normalize expiryDate: strip time to 00:00:00 (date-only for now)
        // TODO: remove toStartOfDay() when time-based expiry is needed
        productStock.setExpiryDate(toStartOfDay(request.getExpiryDate()));

        ProductStock savedProductStock = productStockRepository.save(productStock);
        log.info("✅ CREATED - ID: {}, SKU: {}, Barcode: {}", savedProductStock.getId(),
                savedProductStock.getSku(), savedProductStock.getBarcode());

        ProductStockDto dto = productStockMapper.toDto(savedProductStock);
        enrichWithProductInfo(dto, savedProductStock);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductStockDto> getAllProductStocks(ProductStockFilterRequest request) {
        log.info("🔍 PRODUCT STOCK FILTER REQUEST - Business: {}", request.getBusinessId());

        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        // Log all filter parameters
        log.debug("📋 Applied Filters:");
        log.debug("  - Product ID: {}", request.getProductId());
        log.debug("  - Size ID: {}", request.getProductSizeId());
        log.debug("  - Status: {}", request.getStatus());
        log.debug("  - Low Stock Threshold: {}", request.getLowStockThreshold());
        log.debug("  - Expired Before: {}", request.getExpiredBefore());
        log.debug("  - Search: {}", request.getSearch());
        log.debug("  - Pagination: page={}, size={}, sort={} {}",
                request.getPageNo(), request.getPageSize(),
                request.getSortBy(), request.getSortDirection());

        long startTime = System.currentTimeMillis();

        // Use unsorted Pageable since the native query has its own ORDER BY with NULLS LAST
        int pageNo = (request.getPageNo() == null || request.getPageNo() <= 0) ? 0 : request.getPageNo() - 1;
        int pageSize = (request.getPageSize() == null) ? 15 : request.getPageSize();
        PaginationUtils.validatePagination(pageNo, pageSize);
        Pageable pageable = PageRequest.of(pageNo, pageSize);

        String status = request.getStatus() != null ? request.getStatus().name() : null;
        String search = (request.getSearch() != null && !request.getSearch().isBlank())
                ? request.getSearch() : null;

        Page<ProductStock> productStockPage = productStockRepository.findWithFilters(
                request.getBusinessId(),
                request.getProductId(),
                request.getProductSizeId(),
                status,
                request.getLowStockThreshold(),
                request.getExpiredBefore(),
                search,
                pageable
        );

        long executionTime = System.currentTimeMillis() - startTime;
        log.info("✅ PRODUCT STOCK FILTER COMPLETE - Total: {}, Returned: {}, Time: {}ms",
                productStockPage.getTotalElements(), productStockPage.getNumberOfElements(), executionTime);

        PaginationResponse<ProductStockDto> response = productStockMapper.toPaginationResponse(productStockPage, paginationMapper);

        // Enrich each DTO with product name and size name
        List<ProductStock> stocks = productStockPage.getContent();
        List<ProductStockDto> dtos = response.getContent();
        for (int i = 0; i < dtos.size(); i++) {
            enrichWithProductInfo(dtos.get(i), stocks.get(i));
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductStockDto getProductStockById(UUID productStockId) {
        log.debug("📖 GET by ID: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> {
                    log.warn("⚠️  NOT FOUND - ID: {}", productStockId);
                    return new ValidationException("Product stock not found");
                });

        log.debug("✅ FOUND - SKU: {}, Qty: {}", productStock.getSku(), productStock.getQuantityOnHand());

        ProductStockDto dto = productStockMapper.toDto(productStock);
        enrichWithProductInfo(dto, productStock);
        return dto;
    }

    @Override
    public ProductStockDto updateProductStock(UUID productStockId, ProductStockUpdateRequest request) {
        log.info("📝 UPDATE - ID: {}, New Qty: {}", productStockId, request.getQuantityOnHand());

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> {
                    log.warn("⚠️  UPDATE NOT FOUND - ID: {}", productStockId);
                    return new ValidationException("Product stock not found");
                });

        Integer oldQty = productStock.getQuantityOnHand();
        productStockMapper.updateEntityFromRequest(request, productStock);

        // Normalize expiryDate: strip time to 00:00:00 (date-only for now)
        // TODO: remove toStartOfDay() when time-based expiry is needed
        if (request.getExpiryDate() != null) {
            productStock.setExpiryDate(toStartOfDay(request.getExpiryDate()));
        }

        ProductStock updatedProductStock = productStockRepository.save(productStock);

        log.info("✅ UPDATED - ID: {}, Qty: {} → {}", updatedProductStock.getId(),
                oldQty, updatedProductStock.getQuantityOnHand());
        ProductStockDto dto = productStockMapper.toDto(updatedProductStock);
        enrichWithProductInfo(dto, updatedProductStock);
        return dto;
    }

    @Override
    public void deleteProductStock(UUID productStockId) {
        log.info("🗑️  DELETE - ID: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> {
                    log.warn("⚠️  DELETE NOT FOUND - ID: {}", productStockId);
                    return new ValidationException("Product stock not found");
                });

        String sku = productStock.getSku();
        Integer qty = productStock.getQuantityOnHand();
        productStockRepository.delete(productStock);

        log.info("✅ DELETED - ID: {}, SKU: {}, Previous Qty: {}", productStockId, sku, qty);
    }

    /**
     * Strips the time part from a LocalDateTime, returning date at 00:00:00.
     * Used for expiryDate — currently date-only; remove this when time-based expiry is needed.
     */
    private LocalDateTime toStartOfDay(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.toLocalDate().atStartOfDay();
    }

    /** Populate productName and sizeName from the product and size repositories */
    private void enrichWithProductInfo(ProductStockDto dto, ProductStock stock) {
        productRepository.findByIdAndIsDeletedFalse(stock.getProductId())
                .ifPresent(product -> dto.setProductName(product.getName()));

        if (stock.getProductSizeId() != null) {
            productSizeRepository.findByIdAndIsDeletedFalse(stock.getProductSizeId())
                    .ifPresent(size -> dto.setSizeName(size.getName()));
        }
    }
}
