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
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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

        log.info("Stock added to product {}: {} units", stock.getProductId(), quantity);
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

        log.info("Stock deducted for order {}: {} units from batch {}", orderId, quantity, stock.getId());
        return mapToDto(movement);
    }

    /**
     * Deduct stock using FIFO - oldest batch first.
     */
    public void deductStockFIFO(UUID businessId, UUID productId, UUID sizeId, Integer quantity, UUID orderId, String reason) {
        log.info("[FIFO DEDUCTION START] Product: {}, Size: {}, Quantity to deduct: {}, Order: {}",
            productId, sizeId, quantity, orderId);

        List<ProductStock> batches = productStockRepository.findActiveBatchesFIFO(productId, sizeId, businessId);
        log.debug("[FIFO BATCHES] Found {} active batches for product {}", batches.size(), productId);

        int remaining = quantity;
        int batchIndex = 0;

        for (ProductStock batch : batches) {
            batchIndex++;
            if (remaining <= 0) {
                log.debug("[FIFO COMPLETE] All units deducted, stopping batch processing");
                break;
            }

            log.debug("[FIFO BATCH {}] ID: {}, On-hand: {}, DateIn: {}, Price: {}",
                batchIndex, batch.getId(), batch.getQuantityOnHand(), batch.getDateIn(), batch.getPriceIn());

            int deduct = Math.min(remaining, batch.getQuantityOnHand());
            int previousQty = batch.getQuantityOnHand();
            int newQty = previousQty - deduct;

            log.debug("[FIFO DEDUCT] Deducting {} from batch {} (was {} now {})",
                deduct, batch.getId(), previousQty, newQty);

            batch.setQuantityOnHand(newQty);
            batch.setDateOut(LocalDateTime.now());
            productStockRepository.save(batch);

            log.debug("[FIFO SAVED] Batch {} updated in database, remaining to deduct: {}",
                batch.getId(), remaining - deduct);

            createStockMovement(
                businessId, batch.getId(), "STOCK_OUT",
                -deduct, previousQty, newQty,
                "ORDER", orderId, reason, getCurrentUserId(), orderId, batch.getPriceIn()
            );

            log.debug("[FIFO MOVEMENT] Stock movement record created for {} units, cost impact: {}",
                deduct, batch.getPriceIn().multiply(java.math.BigDecimal.valueOf(-deduct)));

            remaining -= deduct;
            log.info("[FIFO DEDUCTED] {} units from batch {}, {} units remaining to deduct",
                deduct, batch.getId(), remaining);
        }

        if (remaining > 0) {
            log.warn("[FIFO INSUFFICIENT] Product {} size {}: insufficient stock - {} units short",
                productId, sizeId, remaining);
        } else {
            log.info("[FIFO SUCCESS] All {} units deducted successfully for order {}",
                quantity, orderId);
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

        log.info("Stock returned for order {}", orderId);
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

        log.info("Stock marked as expired: product {}", stock.getProductId());
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
        log.debug("[MOVEMENT CREATE] Type: {}, ProductStock: {}, Change: {}, Previous: {}, New: {}",
            movementType, productStockId, quantityChange, previousQuantity, newQuantity);

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

        BigDecimal costImpact = calculateCostImpact(quantityChange, unitPrice);
        movement.setCostImpact(costImpact);

        log.debug("[MOVEMENT COST] Unit Price: {}, Quantity: {}, Cost Impact: {}",
            unitPrice, quantityChange, costImpact);

        StockMovement saved = stockMovementRepository.save(movement);
        log.debug("[MOVEMENT SAVED] Movement ID: {} saved to database", saved.getId());

        return saved;
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
