package com.emenu.features.stock.service.impl;

import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.features.stock.dto.request.StockMovementFilterRequest;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.mapper.StockMovementMapper;
import com.emenu.features.stock.models.*;
import com.emenu.features.stock.repository.*;
import com.emenu.features.stock.service.StockService;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.InvalidOperationException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.security.SecurityUtils;
import com.emenu.features.stock.specification.StockMovementSpecification;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    private final StockMovementMapper stockMovementMapper;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;

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
            null, reason, stock.getPriceIn()
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
            orderId, reason, stock.getPriceIn()
        );

        log.info("Stock deducted for order {}: {} units from batch {}", orderId, quantity, stock.getId());
        return mapToDto(movement);
    }

    public void deductStockFIFO(UUID businessId, UUID productId, UUID sizeId, Integer quantity, UUID orderId, String reason) {
        log.info("[FIFO DEDUCTION START] Product ID: {}, Size ID: {}, Quantity to deduct: {}, Order: {}",
            productId, sizeId, quantity, orderId);

        List<ProductStock> batches = productStockRepository.findActiveBatchesFIFO(productId, sizeId, businessId);
        int remaining = quantity;
        int batchIndex = 0;

        for (ProductStock batch : batches) {
            batchIndex++;
            if (remaining <= 0) {
                break;
            }
            int availableQty = batch.getQuantityAvailable() != null ? batch.getQuantityAvailable() : batch.getQuantityOnHand();
            if (availableQty <= 0) {
                continue;
            }
            int deduct = Math.min(remaining, availableQty);
            int previousQty = availableQty;
            int newQty = previousQty - deduct;
            batch.setQuantityAvailable(newQty);
            batch.setDateOut(LocalDateTime.now());
            productStockRepository.save(batch);
            createStockMovement(
                businessId, batch.getId(), "STOCK_OUT",
                -deduct, previousQty, newQty,
                orderId, reason, batch.getPriceIn()
            );
            remaining -= deduct;
            log.info("[FIFO DEDUCTED] Product ID: {}, {} units from batch {}, {} units remaining to deduct",
                productId, deduct, batch.getId(), remaining);
        }

        if (remaining > 0) {
            log.warn("[FIFO INSUFFICIENT] Product {} size {}: insufficient stock - {} units short",
                productId, sizeId, remaining);
        } else {
            log.info("[FIFO SUCCESS] Product ID: {}, All {} units deducted successfully for order {}",
                productId, quantity, orderId);
        }

        webSocketNotificationService.notifyStockUpdated(businessId, productId);
    }

    @Override
    public StockMovementDto returnStock(UUID businessId, UUID orderId, String reason) {
        List<StockMovement> orderMovements = stockMovementRepository.findByOrderId(orderId);

        if (orderMovements.isEmpty()) {
            log.warn("No stock movements found for order {}", orderId);
            return new StockMovementDto();
        }

        Set<UUID> affectedProductIds = new HashSet<>();

        for (StockMovement originalMovement : orderMovements) {
            if ("STOCK_OUT".equals(originalMovement.getMovementType())) {
                ProductStock stock = productStockRepository.findById(originalMovement.getProductStockId())
                    .orElse(null);

                if (stock == null) {
                    continue;
                }

                Integer returnQuantity = Math.abs(originalMovement.getQuantityChange());
                Integer prevOnHand = stock.getQuantityOnHand() != null ? stock.getQuantityOnHand() : 0;
                Integer prevAvailable = stock.getQuantityAvailable() != null ? stock.getQuantityAvailable() : prevOnHand;

                Integer newOnHand = prevOnHand + returnQuantity;
                Integer newAvailable = prevAvailable + returnQuantity;

                stock.setQuantityOnHand(newOnHand);
                stock.setQuantityAvailable(newAvailable);
                productStockRepository.save(stock);

                createStockMovement(
                    businessId, stock.getId(), "RETURN",
                    returnQuantity, prevOnHand, newOnHand,
                    orderId, reason, stock.getPriceIn()
                );

                affectedProductIds.add(stock.getProductId());
            }
        }

        for (UUID productId : affectedProductIds) {
            try {
                webSocketNotificationService.notifyStockUpdated(businessId, productId);
            } catch (Exception e) {
                log.warn("Failed to send stock update WebSocket notification for product {}: {}", productId, e.getMessage());
            }
        }

        log.info("Stock successfully returned/added back for order {}", orderId);
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
            null, reason, stock.getPriceIn()
        );

        log.info("Stock marked as expired: product {}", stock.getProductId());
        return mapToDto(movement);
    }

    // ========== Movements ==========

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<StockMovementDto> getAllMovements(StockMovementFilterRequest request) {
        log.info("Get all stock movements - business: {}, type: {}", request.getBusinessId(), request.getMovementType());

        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        Pageable pageable = PaginationUtils.createPageable(request.getPageNo(), request.getPageSize());

        Specification<StockMovement> spec = StockMovementSpecification.filterMovements(
                request.getBusinessId(),
                request.getProductStockId(),
                request.getMovementType(),
                request.getFromDate(),
                request.getToDate()
            );

        Page<StockMovement> movementPage = stockMovementRepository.findAll(spec, pageable);

        return paginationMapper.toPaginationResponse(
            movementPage,
            movements -> movements.stream()
                .map(stockMovementMapper::toDto)
                .toList()
        );
    }

    // ========== Helper Methods ==========

    private StockMovement createStockMovement(
        UUID businessId, UUID productStockId, String movementType,
        Integer quantityChange, Integer previousQuantity, Integer newQuantity,
        UUID orderId, String notes, BigDecimal unitPrice
    ) {
        StockMovement movement = new StockMovement();
        movement.setBusinessId(businessId);
        movement.setProductStockId(productStockId);
        movement.setMovementType(movementType);
        movement.setQuantityChange(quantityChange);
        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(newQuantity);
        movement.setOrderId(orderId);
        movement.setNotes(notes);
        movement.setUnitPrice(unitPrice != null ? unitPrice : BigDecimal.ZERO);

        BigDecimal costImpact = calculateCostImpact(quantityChange, unitPrice);
        movement.setCostImpact(costImpact);
        StockMovement saved = stockMovementRepository.save(movement);
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

    private StockMovementDto mapToDto(StockMovement movement) {
        return stockMovementMapper.toDto(movement);
    }
}


