package com.emenu.features.stock.service.impl;

import com.emenu.exception.custom.ValidationException;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.main.repository.ProductSizeRepository;
import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
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
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
        productStock.setExpiryDate(toStartOfDay(request.getExpiryDate()));

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

        int pageNo = (request.getPageNo() == null || request.getPageNo() <= 0) ? 0 : request.getPageNo() - 1;
        int pageSize = (request.getPageSize() == null) ? 15 : request.getPageSize();
        PaginationUtils.validatePagination(pageNo, pageSize);
        Pageable pageable = PageRequest.of(pageNo, pageSize);

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

        PaginationResponse<ProductStockDto> response = productStockMapper.toPaginationResponse(productStockPage, paginationMapper);

        List<ProductStock> stocks = productStockPage.getContent();
        List<ProductStockDto> dtos = response.getContent();
        for (int i = 0; i < dtos.size(); i++) {
            enrichWithProductInfo(dtos.get(i), stocks.get(i));
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductStockItemDto> getAllProductStockItems(ProductStockFilterRequest request) {
        log.info("Get all product stock items - business: {}", request.getBusinessId());

        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        int pageNo = (request.getPageNo() == null || request.getPageNo() <= 0) ? 0 : request.getPageNo() - 1;
        int pageSize = (request.getPageSize() == null) ? 15 : request.getPageSize();
        PaginationUtils.validatePagination(pageNo, pageSize);

        String status = request.getStatus() != null ? request.getStatus().name() : null;
        String stockStatus = request.getStockStatus() != null ? request.getStockStatus().name() : null;
        String search = (request.getSearch() != null && !request.getSearch().isBlank())
                ? request.getSearch() : null;

        // Build Pageable with sorting
        String sortBy = (request.getSortBy() != null && !request.getSortBy().isBlank())
                ? request.getSortBy() : "createdAt";
        String sortDirection = (request.getSortDirection() != null && !request.getSortDirection().isBlank())
                ? request.getSortDirection().toUpperCase() : "DESC";

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(direction, sortBy));

        // Fetch items with pagination and sorting from repository
        Page<Object[]> pageResult = productStockRepository.findProductStockItems(
                request.getBusinessId(),
                search,
                status,
                stockStatus,
                request.getLowStockThreshold(),
                request.getHasSizes(),
                pageable
        );

        // Convert to DTOs
        List<ProductStockItemDto> pageContent = pageResult.getContent().stream()
                .map(this::mapRowToProductStockItemDto)
                .toList();

        // Build pagination response
        PaginationResponse<ProductStockItemDto> response = new PaginationResponse<>();
        response.setContent(pageContent);
        response.setPageNo(pageResult.getNumber() + 1);
        response.setPageSize(pageResult.getSize());
        response.setTotalPages(pageResult.getTotalPages());
        response.setTotalElements(pageResult.getTotalElements());
        response.setHasNext(pageResult.hasNext());
        response.setHasPrevious(pageResult.hasPrevious());
        response.setFirst(pageResult.isFirst());
        response.setLast(pageResult.isLast());

        return response;
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
            productStock.setExpiryDate(toStartOfDay(request.getExpiryDate()));
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

    private LocalDateTime toStartOfDay(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.toLocalDate().atStartOfDay();
    }

    private void enrichWithProductInfo(ProductStockDto dto, ProductStock stock) {
        productRepository.findByIdAndIsDeletedFalse(stock.getProductId())
                .ifPresent(product -> dto.setProductName(product.getName()));

        if (stock.getProductSizeId() != null) {
            productSizeRepository.findByIdAndIsDeletedFalse(stock.getProductSizeId())
                    .ifPresent(size -> dto.setSizeName(size.getName()));
        }
    }

    private LocalDateTime convertToLocalDateTime(Object obj) {
        if (obj == null) {
            return null;
        }
        if (obj instanceof LocalDateTime) {
            return (LocalDateTime) obj;
        }
        if (obj instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) obj).toLocalDateTime();
        }
        // Fallback for other date/time types
        return null;
    }

    private ProductStockItemDto mapRowToProductStockItemDto(Object[] row) {
        // Row mapping based on the query result columns:
        // 0: product_id, 1: product_size_id, 2: product_name, 3: category_name, 4: brand_name,
        // 5: sku, 6: barcode, 7: size_name, 8: total_stock, 9: status, 10: stock_status,
        // 11: item_type, 12: created_at, 13: updated_at

        UUID productId = (UUID) row[0];
        UUID productSizeId = (UUID) row[1];
        String productName = (String) row[2];
        String categoryName = (String) row[3];
        String brandName = (String) row[4];
        String sku = (String) row[5];
        String barcode = (String) row[6];
        String sizeName = (String) row[7];
        Long totalStock = ((Number) row[8]).longValue();
        String status = (String) row[9];
        String stockStatus = (String) row[10];
        String itemType = (String) row[11];

        // Convert java.sql.Timestamp to java.time.LocalDateTime
        LocalDateTime createdAt = convertToLocalDateTime(row[12]);
        LocalDateTime updatedAt = convertToLocalDateTime(row[13]);

        return ProductStockItemDto.builder()
                .id(productSizeId != null ? productSizeId : productId)
                .productName(productName)
                .categoryName(categoryName)
                .brandName(brandName)
                .sku(sku)
                .barcode(barcode)
                .sizeName(sizeName)
                .totalStock(totalStock)
                .status(status)
                .stockStatus(stockStatus)
                .type(itemType)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }
}
