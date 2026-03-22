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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
        log.info("Creating product stock for business: {}", request.getBusinessId());

        ProductStock productStock = productStockMapper.toEntity(request);
        productStock.setBusinessId(request.getBusinessId());

        // Set dateIn to now on first creation
        productStock.setDateIn(LocalDateTime.now());

        // Normalize expiryDate: strip time to 00:00:00 (date-only for now)
        // TODO: remove toStartOfDay() when time-based expiry is needed
        productStock.setExpiryDate(toStartOfDay(request.getExpiryDate()));

        ProductStock savedProductStock = productStockRepository.save(productStock);
        log.info("Product stock created: {}", savedProductStock.getId());

        ProductStockDto dto = productStockMapper.toDto(savedProductStock);
        enrichWithProductInfo(dto, savedProductStock);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductStockDto> getAllProductStocks(ProductStockFilterRequest request) {
        log.info("Getting all product stocks with filters for business: {}", request.getBusinessId());

        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        Pageable pageable = PaginationUtils.createPageable(
                request.getPageNo(),
                request.getPageSize(),
                request.getSortBy(),
                request.getSortDirection()
        );

        Page<ProductStock> productStockPage = productStockRepository.findByBusinessId(request.getBusinessId(), pageable);
        return productStockMapper.toPaginationResponse(productStockPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductStockDto getProductStockById(UUID productStockId) {
        log.info("Getting product stock by ID: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        ProductStockDto dto = productStockMapper.toDto(productStock);
        enrichWithProductInfo(dto, productStock);
        return dto;
    }

    @Override
    public ProductStockDto updateProductStock(UUID productStockId, ProductStockUpdateRequest request) {
        log.info("Updating product stock: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        productStockMapper.updateEntityFromRequest(request, productStock);

        // Normalize expiryDate: strip time to 00:00:00 (date-only for now)
        // TODO: remove toStartOfDay() when time-based expiry is needed
        if (request.getExpiryDate() != null) {
            productStock.setExpiryDate(toStartOfDay(request.getExpiryDate()));
        }

        ProductStock updatedProductStock = productStockRepository.save(productStock);

        log.info("Product stock updated: {}", updatedProductStock.getId());
        ProductStockDto dto = productStockMapper.toDto(updatedProductStock);
        enrichWithProductInfo(dto, updatedProductStock);
        return dto;
    }

    @Override
    public void deleteProductStock(UUID productStockId) {
        log.info("Deleting product stock: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        productStockRepository.delete(productStock);

        log.info("Product stock deleted: {}", productStockId);
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
