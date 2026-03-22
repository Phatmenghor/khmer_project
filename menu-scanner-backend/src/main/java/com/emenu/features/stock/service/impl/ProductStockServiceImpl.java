package com.emenu.features.stock.service.impl;

import com.emenu.exception.custom.ValidationException;
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

    @Override
    public ProductStockDto createProductStock(UUID businessId, ProductStockCreateRequest request) {
        log.info("Creating product stock for business: {}", businessId);

        // Check if product stock with same product and size already exists
        if (request.getProductSizeId() != null) {
            var existing = productStockRepository.findByProductIdAndProductSizeIdAndBusinessId(
                    request.getProductId(),
                    request.getProductSizeId(),
                    businessId
            );
            if (existing.isPresent()) {
                throw new ValidationException("Product stock for this product and size already exists");
            }
        }

        ProductStock productStock = productStockMapper.toEntity(request);
        productStock.setBusinessId(businessId);
        productStock.setCreatedAt(LocalDateTime.now());
        productStock.setUpdatedAt(LocalDateTime.now());
        productStock.setCreatedBy(null); // Can be enhanced to add authenticated user

        ProductStock savedProductStock = productStockRepository.save(productStock);

        log.info("Product stock created: {}", savedProductStock.getId());
        return productStockMapper.toDto(savedProductStock);
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

        // Use low stock threshold filter if provided
        if (request.getLowStockThreshold() != null && request.getLowStockThreshold() > 0) {
            Page<ProductStock> productStockPage = productStockRepository.findByBusinessIdAndLowStockThreshold(
                    request.getBusinessId(),
                    request.getLowStockThreshold(),
                    pageable
            );
            return productStockMapper.toPaginationResponse(productStockPage, paginationMapper);
        }

        // Default: get by business ID with optional filters applied in memory
        Page<ProductStock> productStockPage = productStockRepository.findByBusinessId(request.getBusinessId(), pageable);
        return productStockMapper.toPaginationResponse(productStockPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductStockDto getProductStockById(UUID productStockId) {
        log.info("Getting product stock by ID: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        return productStockMapper.toDto(productStock);
    }

    @Override
    public ProductStockDto updateProductStock(UUID productStockId, ProductStockUpdateRequest request) {
        log.info("Updating product stock: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        productStockMapper.updateEntityFromRequest(request, productStock);
        productStock.setUpdatedAt(LocalDateTime.now());
        productStock.setUpdatedBy(null); // Can be enhanced to add authenticated user

        ProductStock updatedProductStock = productStockRepository.save(productStock);

        log.info("Product stock updated: {}", updatedProductStock.getId());
        return productStockMapper.toDto(updatedProductStock);
    }

    @Override
    public void deleteProductStock(UUID productStockId) {
        log.info("Deleting product stock: {}", productStockId);

        ProductStock productStock = productStockRepository.findById(productStockId)
                .orElseThrow(() -> new ValidationException("Product stock not found"));

        productStockRepository.delete(productStock);

        log.info("Product stock deleted: {}", productStockId);
    }
}
