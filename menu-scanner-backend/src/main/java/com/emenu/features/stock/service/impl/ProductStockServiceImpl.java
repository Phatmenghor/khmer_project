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
}
