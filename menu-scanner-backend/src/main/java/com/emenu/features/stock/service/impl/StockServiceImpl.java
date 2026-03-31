package com.emenu.features.stock.service.impl;

import com.emenu.features.stock.dto.request.StockMovementFilterRequest;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.models.*;
import com.emenu.features.stock.repository.*;
import com.emenu.features.stock.service.StockService;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.InvalidOperationException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StockServiceImpl implements StockService {

    private final ProductStockRepository productStockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PaginationMapper paginationMapper;

    // ========== Stock Operations ==========

    @Override
    public StockMovementDto addStock(UUID businessId, UUID productStockId, Integer quantity, String reason, UUID userId) {
        ProductStock stock = productStockRepository.findById(productStockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));

        validateBusinessOwnership(stock.getBusinessId(), businessId);

        Integer previousQty = stock.getQuantityOnHand();
        Integer newQty = previousQty + quantity;

        stock.setQuantityOnHand(newQty);
        stock.setDateIn(LocalDateTime.now());
        productStockRepository.save(stock);

        StockMovement movement = createStockMovement(
            businessId, stock.getId(), "STOCK_IN",
            quantity, previousQty, newQty,
            null, null, reason, userId, null, stock.getPriceIn()
        );

        return mapToDto(movement);
    }

    @Override
    public StockMovementDto deductStock(UUID businessId, UUID productStockId, Integer quantity, UUID orderId, String reason) {
        ProductStock stock = productStockRepository.findById(productStockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));

        validateBusinessOwnership(stock.getBusinessId(), businessId);

        Integer previousQty = stock.getQuantityOnHand();
        Integer newQty = previousQty - quantity;

        stock.setQuantityOnHand(newQty);
        stock.setDateOut(LocalDateTime.now());
        productStockRepository.save(stock);

        StockMovement movement = createStockMovement(
            businessId, stock.getId(), "STOCK_OUT",
            -quantity, previousQty, newQty,
            "ORDER", orderId, reason, getCurrentUserId(), orderId, stock.getPriceIn()
        );

        return mapToDto(movement);
    }

    /**
     * Deduct stock using FIFO - oldest batch first.
     */
    public void deductStockFIFO(UUID businessId, UUID productId, UUID sizeId, Integer quantity, UUID orderId, String reason) {
        List<ProductStock> batches = productStockRepository.findActiveBatchesFIFO(productId, sizeId, businessId);

        int remaining = quantity;

        for (ProductStock batch : batches) {
            if (remaining <= 0) break;

            int deduct = Math.min(remaining, batch.getQuantityOnHand());
            int previousQty = batch.getQuantityOnHand();
            int newQty = previousQty - deduct;

            batch.setQuantityOnHand(newQty);
            batch.setDateOut(LocalDateTime.now());
            productStockRepository.save(batch);

            createStockMovement(
                businessId, batch.getId(), "STOCK_OUT",
                -deduct, previousQty, newQty,
                "ORDER", orderId, reason, getCurrentUserId(), orderId, batch.getPriceIn()
            );

            remaining -= deduct;
        }
    }

    @Override
    public StockMovementDto returnStock(UUID businessId, UUID orderId, String reason) {
        List<StockMovement> orderMovements = stockMovementRepository.findByOrderId(orderId);

        if (orderMovements.isEmpty()) {
            throw new ResourceNotFoundException("No stock movements found for order");
        }

        for (StockMovement originalMovement : orderMovements) {
            if ("STOCK_OUT".equals(originalMovement.getMovementType())) {
                ProductStock stock = productStockRepository.findById(originalMovement.getProductStockId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));

                Integer returnQuantity = Math.abs(originalMovement.getQuantityChange());
                Integer newQty = stock.getQuantityOnHand() + returnQuantity;

                stock.setQuantityOnHand(newQty);
                productStockRepository.save(stock);

                createStockMovement(
                    businessId, stock.getId(), "RETURN",
                    returnQuantity, stock.getQuantityOnHand() - returnQuantity, newQty,
                    "ORDER", orderId, reason, getCurrentUserId(), orderId, stock.getPriceIn()
                );
            }
        }

        return new StockMovementDto();
    }

    @Override
    public StockMovementDto markExpired(UUID businessId, UUID productStockId, String reason, UUID userId) {
        ProductStock stock = productStockRepository.findById(productStockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));

        validateBusinessOwnership(stock.getBusinessId(), businessId);

        if (stock.getIsExpired()) {
            throw new InvalidOperationException("Stock already marked as expired");
        }

        stock.setIsExpired(true);
        stock.setQuantityAvailable(0);
        productStockRepository.save(stock);

        StockMovement movement = createStockMovement(
            businessId, stock.getId(), "EXPIRY",
            0, stock.getQuantityOnHand(), stock.getQuantityOnHand(),
            null, null, reason, userId, null, stock.getPriceIn()
        );

        return mapToDto(movement);
    }

    // ========== Movements ==========

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<StockMovementDto> getAllMovements(StockMovementFilterRequest request) {
        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        int pageNo = (request.getPageNo() == null || request.getPageNo() <= 0) ? 0 : request.getPageNo() - 1;
        int pageSize = (request.getPageSize() == null) ? 15 : request.getPageSize();
        PaginationUtils.validatePagination(pageNo, pageSize);
        Pageable pageable = PageRequest.of(pageNo, pageSize);

        Page<StockMovement> movementPage = stockMovementRepository.findWithFilters(
            request.getBusinessId(),
            request.getProductStockId(),
            request.getProductId(),
            request.getMovementType(),
            request.getFromDate(),
            request.getToDate(),
            pageable
        );

        List<StockMovementDto> dtos = movementPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return paginationMapper.toPaginationResponse(movementPage, dtos);
    }

    // ========== Helper Methods ==========

    private StockMovement createStockMovement(
        UUID businessId, UUID productStockId, String movementType,
        Integer quantityChange, Integer previousQuantity, Integer newQuantity,
        String referenceType, UUID referenceId, String notes,
        UUID initiatedBy, UUID orderId, BigDecimal unitPrice
    ) {
        StockMovement movement = new StockMovement();
        movement.setBusinessId(businessId);
        movement.setProductStockId(productStockId);
        movement.setMovementType(movementType);
        movement.setQuantityChange(quantityChange);
        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(newQuantity);
        movement.setReferenceType(referenceType);
        movement.setReferenceId(referenceId);
        movement.setOrderId(orderId);
        movement.setNotes(notes);
        movement.setInitiatedBy(initiatedBy);
        movement.setUnitPrice(unitPrice != null ? unitPrice : BigDecimal.ZERO);
        movement.setCostImpact(calculateCostImpact(quantityChange, unitPrice));

        return stockMovementRepository.save(movement);
    }

    private BigDecimal calculateCostImpact(Integer quantityChange, BigDecimal unitPrice) {
        if (quantityChange == null || unitPrice == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantityChange));
    }

    private void validateBusinessOwnership(UUID resourceBusinessId, UUID requestBusinessId) {
        if (!resourceBusinessId.equals(requestBusinessId)) {
            throw new InvalidOperationException("Unauthorized access to this resource");
        }
    }

    private UUID getCurrentUserId() {
        // TODO: Get from SecurityContext
        return UUID.randomUUID();
    }

    private StockMovementDto mapToDto(StockMovement movement) {
        StockMovementDto dto = new StockMovementDto();
        dto.setId(movement.getId());
        dto.setBusinessId(movement.getBusinessId());
        dto.setProductStockId(movement.getProductStockId());
        dto.setMovementType(movement.getMovementType());
        dto.setQuantityChange(movement.getQuantityChange());
        dto.setPreviousQuantity(movement.getPreviousQuantity());
        dto.setNewQuantity(movement.getNewQuantity());
        dto.setReferenceType(movement.getReferenceType());
        dto.setReferenceId(movement.getReferenceId());
        dto.setOrderId(movement.getOrderId());
        dto.setNotes(movement.getNotes());
        dto.setInitiatedBy(movement.getInitiatedBy());
        dto.setInitiatedByName(movement.getInitiatedByName());
        dto.setCostImpact(movement.getCostImpact());
        dto.setUnitPrice(movement.getUnitPrice());
        dto.setCreatedAt(movement.getCreatedAt());
        return dto;
    }
}
