package com.emenu.features.stock.service.impl;

import com.emenu.enums.product.PromotionStatus;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.main.repository.ProductSizeRepository;
import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockItemsFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
import com.emenu.features.stock.mapper.ProductStockMapper;
import com.emenu.features.stock.models.ProductStock;
import com.emenu.features.stock.repository.ProductStockRepository;
import com.emenu.features.stock.repository.projection.ProductStockItemProjection;
import com.emenu.features.stock.service.ProductStockService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
        log.info("Create product stock - business: {}, product: {}", request.getBusinessId(), request.getProductId());

        ProductStock productStock = productStockMapper.toEntity(request);
        productStock.setBusinessId(request.getBusinessId());
        productStock.setDateIn(LocalDateTime.now());
        if (request.getExpiryDate() != null) {
            productStock.setExpiryDate(request.getExpiryDate());
        }

        ProductStock savedProductStock = productStockRepository.save(productStock);
        log.info("Created product stock - id: {}", savedProductStock.getId());

        ProductStockDto dto = productStockMapper.toDto(savedProductStock);
        enrichWithProductInfo(dto, savedProductStock);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductStockDto> getAllProductStocks(ProductStockFilterRequest request) {
        log.info("Get all product stocks - business: {}", request.getBusinessId());

        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        Pageable pageable = PaginationUtils.createPageableForNativeQuery(
                request.getPageNo(),
                request.getPageSize(),
                request.getSortBy() != null && !request.getSortBy().isBlank() ? request.getSortBy() : "dateIn",
                request.getSortDirection()
        );

        String status = request.getStatus() != null ? request.getStatus().name() : null;
        String stockStatus = request.getStockStatus() != null ? request.getStockStatus().name() : null;
        String search = (request.getSearch() != null && !request.getSearch().isBlank())
                ? request.getSearch() : null;

        Page<ProductStock> productStockPage = productStockRepository.findWithFilters(
                request.getBusinessId(),
                request.getProductId(),
                request.getProductSizeId(),
                status,
                stockStatus,
                request.getLowStockThreshold(),
                request.getExpiredBefore(),
                search,
                pageable
        );

        // Use PaginationMapper with transformation function for clean mapping + enrichment
        return paginationMapper.toPaginationResponse(
                productStockPage,
                stocks -> stocks.stream()
                        .map(stock -> {
                            ProductStockDto dto = productStockMapper.toDto(stock);
                            enrichWithProductInfo(dto, stock);
                            return dto;
                        })
                        .toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductStockItemDto> getAllProductStockItems(ProductStockFilterRequest request) {
        log.info("Get all product stock items - business: {}", request.getBusinessId());

        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        String status = request.getStatus() != null ? request.getStatus().name() : null;
        String stockStatus = request.getStockStatus() != null ? request.getStockStatus().name() : null;
        String search = (request.getSearch() != null && !request.getSearch().isBlank())
                ? request.getSearch() : null;

        Pageable pageable = PaginationUtils.createPageableForNativeQuery(
                request.getPageNo(),
                request.getPageSize(),
                request.getSortBy(),
                request.getSortDirection()
        );

        Page<ProductStockItemProjection> pageResult = productStockRepository.findProductStockItems(
                request.getBusinessId(),
                search,
                status,
                stockStatus,
                request.getCategoryId(),
                request.getBrandId(),
                request.getLowStockThreshold(),
                request.getHasSizes(),
                pageable
        );

        return paginationMapper.toPaginationResponse(
                pageResult,
                productStockMapper::toItemDtoList
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductStockItemDto> getProductStockItems(ProductStockItemsFilterRequest request) {
        log.info("Get product stock items (type-safe) - business: {}", request.getBusinessId());

        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        String status = request.getStatus() != null ? request.getStatus().name() : null;
        String stockStatus = request.getStockStatus() != null ? request.getStockStatus().name() : null;
        String search = (request.getSearch() != null && !request.getSearch().isBlank())
                ? request.getSearch() : null;

        String sortByField = convertSortFieldName(request.getSortBy());

        Pageable pageable = PaginationUtils.createPageableForNativeQuery(
                request.getPageNo(),
                request.getPageSize(),
                sortByField,
                request.getSortDirection()
        );

        Page<ProductStockItemProjection> pageResult = productStockRepository.findProductStockItems(
                request.getBusinessId(),
                search,
                status,
                stockStatus,
                request.getCategoryId(),
                request.getBrandId(),
                request.getLowStockThreshold(),
                request.getHasSizes(),
                pageable
        );

        return paginationMapper.toPaginationResponse(
                pageResult,
                productStockMapper::toItemDtoList
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductStockDto getProductStockById(UUID productStockId) {
        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        ProductStockDto dto = productStockMapper.toDto(productStock);
        enrichWithProductInfo(dto, productStock);
        return dto;
    }

    @Override
    public ProductStockDto updateProductStock(UUID productStockId, ProductStockUpdateRequest request) {
        log.info("Update product stock - id: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        productStockMapper.updateEntityFromRequest(request, productStock);

        if (request.getExpiryDate() != null) {
            productStock.setExpiryDate(request.getExpiryDate());
        }

        ProductStock updatedProductStock = productStockRepository.save(productStock);
        ProductStockDto dto = productStockMapper.toDto(updatedProductStock);
        enrichWithProductInfo(dto, updatedProductStock);
        return dto;
    }

    @Override
    public void deleteProductStock(UUID productStockId) {
        log.info("Delete product stock - id: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        productStockRepository.delete(productStock);
    }

    private void enrichWithProductInfo(ProductStockDto dto, ProductStock stock) {
        productRepository.findByIdAndIsDeletedFalse(stock.getProductId())
                .ifPresent(product -> dto.setProductName(product.getName()));

        if (stock.getProductSizeId() != null) {
            productSizeRepository.findByIdAndIsDeletedFalse(stock.getProductSizeId())
                    .ifPresent(size -> dto.setSizeName(size.getName()));
        }
    }

    private String convertSortFieldName(String camelCase) {
        if (camelCase == null || camelCase.isBlank()) {
            return "total_stock";
        }

        return switch (camelCase) {
            case "totalStock" -> "total_stock";
            case "productName" -> "product_name";
            case "categoryName" -> "category_name";
            case "brandName" -> "brand_name";
            case "stockStatus" -> "stock_status";
            case "sizeName" -> "size_name";
            case "createdAt" -> "created_at";
            case "updatedAt" -> "updated_at";
            case "sku", "barcode", "status" -> camelCase;
            default -> "total_stock";
        };
    }
}

