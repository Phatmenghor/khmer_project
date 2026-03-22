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
    public ProductStockDto createProductStock(UUID businessId, ProductStockCreateRequest request) {
        log.info("Creating product stock for business: {}", businessId);

        // Check if product stock with same product and size already exists
        if (request.getProductSizeId() != null) {
            productStockRepository.findByProductIdAndProductSizeIdAndBusinessId(
                    request.getProductId(),
                    request.getProductSizeId(),
                    businessId
            ).ifPresent(existing -> {
                throw new ValidationException("Product stock for this product and size already exists");
            });
        }

        ProductStock productStock = productStockMapper.toEntity(request);
        productStock.setBusinessId(businessId);

        // Default costPerUnit to priceIn if not provided
        if (productStock.getCostPerUnit() == null) {
            productStock.setCostPerUnit(productStock.getPriceIn());
        }

        // Set dateIn to now on first creation
        productStock.setDateIn(LocalDateTime.now());

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
