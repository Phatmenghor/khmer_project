package com.emenu.features.stock.service.impl;

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

        // Use utility to create pageable with native query sorting
        Pageable pageable = PaginationUtils.createPageableForNativeQuery(
                request.getPageNo(),
                request.getPageSize(),
                request.getSortBy(),
                request.getSortDirection()
        );

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

        // Use PaginationMapper with transformation function for clean mapping
        return paginationMapper.toPaginationResponse(
                pageResult,
                rows -> rows.stream()
                        .map(this::mapRowToProductStockItemDto)
                        .toList()
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

        // Convert camelCase field names to snake_case for database queries
        String sortByField = convertSortFieldName(request.getSortBy());

        // Use utility to create pageable with native query sorting
        Pageable pageable = PaginationUtils.createPageableForNativeQuery(
                request.getPageNo(),
                request.getPageSize(),
                sortByField,
                request.getSortDirection()
        );

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

        // Use PaginationMapper with transformation function for clean mapping
        return paginationMapper.toPaginationResponse(
                pageResult,
                rows -> rows.stream()
                        .map(this::mapRowToProductStockItemDto)
                        .toList()
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
        // Row mapping based on the extended query result columns (with sales preview fields):
        // 0: product_id, 1: product_size_id, 2: product_name, 3: description,
        // 4: category_id, 5: category_name, 6: brand_id, 7: brand_name,
        // 8: sku, 9: barcode, 10: size_name, 11: price,
        // 12: display_price, 13: display_promotion_type, 14: display_promotion_value,
        // 15: display_promotion_from_date, 16: display_promotion_to_date, 17: has_promotion,
        // 18: total_stock, 19: quantity_available, 20: quantity_reserved, 21: quantity_on_hand,
        // 22: main_image_url, 23: status, 24: stock_status, 25: item_type,
        // 26: created_at, 27: updated_at

        UUID productId = (UUID) row[0];
        UUID productSizeId = (UUID) row[1];
        String productName = (String) row[2];
        String description = (String) row[3];
        UUID categoryId = (UUID) row[4];
        String categoryName = (String) row[5];
        UUID brandId = (UUID) row[6];
        String brandName = (String) row[7];
        String sku = (String) row[8];
        String barcode = (String) row[9];
        String sizeName = (String) row[10];
        String price = (String) row[11];
        BigDecimal displayPrice = row[12] != null ? (BigDecimal) row[12] : null;
        String displayPromotionType = (String) row[13];
        BigDecimal displayPromotionValue = row[14] != null ? (BigDecimal) row[14] : null;
        LocalDateTime displayPromotionFromDate = convertToLocalDateTime(row[15]);
        LocalDateTime displayPromotionToDate = convertToLocalDateTime(row[16]);
        Boolean hasPromotion = row[17] != null ? (Boolean) row[17] : false;
        Long totalStock = ((Number) row[18]).longValue();
        Long quantityAvailable = ((Number) row[19]).longValue();
        Long quantityReserved = ((Number) row[20]).longValue();
        Long quantityOnHand = ((Number) row[21]).longValue();
        String mainImageUrl = (String) row[22];
        String status = (String) row[23];
        String stockStatus = (String) row[24];
        String itemType = (String) row[25];

        // Convert java.sql.Timestamp to java.time.LocalDateTime
        LocalDateTime createdAt = convertToLocalDateTime(row[26]);
        LocalDateTime updatedAt = convertToLocalDateTime(row[27]);

        return ProductStockItemDto.builder()
                .id(productSizeId != null ? productSizeId : productId)
                .productId(productId)
                .productSizeId(productSizeId)
                .productName(productName)
                .description(description)
                .categoryId(categoryId)
                .categoryName(categoryName)
                .brandId(brandId)
                .brandName(brandName)
                .sku(sku)
                .barcode(barcode)
                .sizeName(sizeName)
                .price(price)
                .displayPrice(displayPrice)
                .displayPromotionType(displayPromotionType)
                .displayPromotionValue(displayPromotionValue)
                .displayPromotionFromDate(displayPromotionFromDate)
                .displayPromotionToDate(displayPromotionToDate)
                .hasPromotion(hasPromotion)
                .totalStock(totalStock)
                .quantityAvailable(quantityAvailable)
                .quantityReserved(quantityReserved)
                .quantityOnHand(quantityOnHand)
                .mainImageUrl(mainImageUrl)
                .status(status)
                .stockStatus(stockStatus)
                .type(itemType)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }

    /**
     * Convert camelCase field names to snake_case for database queries.
     * Maps user-friendly field names to actual database column names.
     */
    private String convertSortFieldName(String camelCase) {
        if (camelCase == null || camelCase.isBlank()) {
            return "total_stock";  // Default sort field
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
            // Fields that don't need conversion
            case "sku", "barcode", "status" -> camelCase;
            default -> "total_stock";  // Fallback to default
        };
    }
}
