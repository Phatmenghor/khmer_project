package com.emenu.features.stock.service.impl;

import com.emenu.features.stock.dto.request.StockAdjustmentRequest;
import com.emenu.features.stock.dto.request.StockAlertFilterRequest;
import com.emenu.features.stock.dto.request.StockMovementFilterRequest;
import com.emenu.features.stock.dto.response.StockAlertDto;
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
    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final StockAlertRepository stockAlertRepository;
    private final PaginationMapper paginationMapper;

    // ========== Stock Adjustment Operations ==========

    @Override
    public StockMovementDto adjustStock(UUID businessId, StockAdjustmentRequest request) {
        ProductStock stock = productStockRepository.findById(request.getProductStockId())
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));

        validateBusinessOwnership(stock.getBusinessId(), businessId);

        Integer previousQty = stock.getQuantityOnHand();
        Integer newQty = previousQty + request.getAdjustmentQuantity();

        if (newQty < 0) {
            throw new InvalidOperationException("Cannot reduce stock below 0");
        }

        StockAdjustment adjustment = new StockAdjustment();
        adjustment.setBusinessId(businessId);
        adjustment.setProductStockId(stock.getId());
        adjustment.setAdjustmentType(request.getAdjustmentType());
        adjustment.setPreviousQuantity(previousQty);
        adjustment.setAdjustedQuantity(newQty);
        adjustment.setQuantityDifference(request.getAdjustmentQuantity());
        adjustment.setReason(request.getReason());
        adjustment.setDetailNotes(request.getDetailNotes());
        adjustment.setRequiresApproval(request.getRequiresApproval() != null && request.getRequiresApproval());
        adjustment.setApproved(false);
        adjustment.setAdjustedBy(getCurrentUserId());
        adjustment.setAdjustedAt(LocalDateTime.now());

        stockAdjustmentRepository.save(adjustment);

        stock.setQuantityOnHand(newQty);
        stock.setDateIn(LocalDateTime.now());
        productStockRepository.save(stock);

        StockMovement movement = createStockMovement(
            businessId, stock.getId(), "ADJUSTMENT",
            request.getAdjustmentQuantity(), previousQty, newQty,
            "ADJUSTMENT", adjustment.getId(),
            request.getReason(), getCurrentUserId(), null, null
        );

        log.info("Stock adjusted for product {}: {} -> {}", stock.getProductId(), previousQty, newQty);
        return mapToDto(movement);
    }

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

        if (newQty < 0) {
            createOrUpdateAlert(businessId, stock, "NEGATIVE_STOCK");
        }

        log.info("Stock deducted for order {}: {} units from batch {}", orderId, quantity, stock.getId());
        return mapToDto(movement);
    }

    /**
     * Deduct stock using FIFO - oldest batch first.
     * Called when an order is confirmed to automatically cut stock across batches.
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
            log.info("FIFO deducted {} units from batch {} (dateIn: {}), remaining: {}", deduct, batch.getId(), batch.getDateIn(), remaining);
        }

        if (remaining > 0) {
            log.warn("Insufficient stock for product {} size {}: {} units short", productId, sizeId, remaining);
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

        createOrUpdateAlert(businessId, stock, "EXPIRED");

        log.info("Stock marked as expired: product {}", stock.getProductId());
        return mapToDto(movement);
    }

    // ========== Alerts ==========

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<StockAlertDto> getAllAlerts(StockAlertFilterRequest request) {
        if (request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }

        int pageNo = (request.getPageNo() == null || request.getPageNo() <= 0) ? 0 : request.getPageNo() - 1;
        int pageSize = (request.getPageSize() == null) ? 15 : request.getPageSize();
        PaginationUtils.validatePagination(pageNo, pageSize);
        Pageable pageable = PageRequest.of(pageNo, pageSize);

        Page<StockAlert> alertPage = stockAlertRepository.findWithFilters(
            request.getBusinessId(),
            request.getProductId(),
            request.getAlertType(),
            request.getStatus(),
            pageable
        );

        List<StockAlertDto> dtos = alertPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return paginationMapper.toPaginationResponse(alertPage, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countActiveAlerts(UUID businessId) {
        return stockAlertRepository.countActiveAlerts(businessId);
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

    private void createOrUpdateAlert(UUID businessId, ProductStock stock, String alertType) {
        List<StockAlert> existingAlerts = stockAlertRepository.findByProductStockIdAndAlertTypeAndStatusOrderByCreatedAtDesc(stock.getId(), alertType, "ACTIVE");

        if (existingAlerts.isEmpty()) {
            StockAlert alert = new StockAlert();
            alert.setBusinessId(businessId);
            alert.setProductStockId(stock.getId());
            alert.setAlertType(alertType);
            alert.setProductId(stock.getProductId());
            alert.setProductSizeId(stock.getProductSizeId());
            alert.setCurrentQuantity(stock.getQuantityOnHand());
            alert.setThreshold(0);
            alert.setExpiryDate(stock.getExpiryDate());
            alert.setDaysUntilExpiry(stock.getDaysUntilExpiry());
            alert.setStatus("ACTIVE");
            alert.setNotificationSent(false);
            alert.setNotificationType("NONE");

            stockAlertRepository.save(alert);
        }
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

    private StockAlertDto mapToDto(StockAlert alert) {
        StockAlertDto dto = new StockAlertDto();
        dto.setId(alert.getId());
        dto.setBusinessId(alert.getBusinessId());
        dto.setProductStockId(alert.getProductStockId());
        dto.setAlertType(alert.getAlertType());
        dto.setProductId(alert.getProductId());
        dto.setProductSizeId(alert.getProductSizeId());
        dto.setProductName(alert.getProductName());
        dto.setCurrentQuantity(alert.getCurrentQuantity());
        dto.setThreshold(alert.getThreshold());
        dto.setExpiryDate(alert.getExpiryDate());
        dto.setDaysUntilExpiry(alert.getDaysUntilExpiry());
        dto.setStatus(alert.getStatus());
        dto.setAcknowledgedBy(alert.getAcknowledgedBy());
        dto.setAcknowledgedAt(alert.getAcknowledgedAt());
        dto.setResolvedAt(alert.getResolvedAt());
        dto.setNotificationSent(alert.getNotificationSent());
        dto.setNotificationType(alert.getNotificationType());
        dto.setCreatedAt(alert.getCreatedAt());
        return dto;
    }
}
