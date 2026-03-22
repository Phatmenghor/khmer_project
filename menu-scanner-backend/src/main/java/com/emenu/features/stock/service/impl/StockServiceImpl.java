package com.emenu.features.stock.service.impl;

import com.emenu.features.stock.dto.request.StockAdjustmentRequest;
import com.emenu.features.stock.dto.request.StockQueryRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.StockAlertDto;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.models.*;
import com.emenu.features.stock.repository.*;
import com.emenu.features.stock.service.StockService;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.InvalidOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final BarcodeMappingRepository barcodeMappingRepository;

    // ========== Stock Query Operations ==========

    @Override
    public ProductStockDto getStockByProductAndSize(UUID productId, UUID sizeId, UUID businessId) {
        ProductStock stock = productStockRepository
            .findByProductIdAndProductSizeIdAndBusinessId(productId, sizeId, businessId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));
        return mapToDto(stock);
    }

    @Override
    public ProductStockDto getStockById(UUID stockId) {
        ProductStock stock = productStockRepository.findById(stockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));
        return mapToDto(stock);
    }

    @Override
    public List<ProductStockDto> getAllStockByBusiness(UUID businessId) {
        return productStockRepository.findByBusinessId(businessId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProductStockDto> getLowStockProducts(UUID businessId) {
        return productStockRepository.findLowStockProducts(businessId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProductStockDto> getExpiredProducts(UUID businessId) {
        return productStockRepository.findExpiredProducts(businessId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProductStockDto> getExpiringProducts(UUID businessId, Integer daysAhead) {
        return productStockRepository.findExpiringProducts(businessId, daysAhead)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public Page<ProductStockDto> searchStock(StockQueryRequest request) {
        Pageable pageable = PageRequest.of(
            request.getPageNo() - 1,
            request.getPageSize()
        );

        Page<ProductStock> stocks;

        if (request.getSearchText() != null && !request.getSearchText().isEmpty()) {
            stocks = productStockRepository.searchByBusinessIdAndNameOrBarcodeOrSku(
                request.getBusinessId(),
                request.getSearchText(),
                pageable
            );
        } else if (request.getLowStockOnly() != null && request.getLowStockOnly()) {
            stocks = productStockRepository.findLowStockProductsPaginated(
                request.getBusinessId(),
                pageable
            );
        } else {
            stocks = productStockRepository.findByBusinessId(
                request.getBusinessId(),
                pageable
            );
        }

        return stocks.map(this::mapToDto);
    }

    // ========== Stock Availability Checks ==========

    @Override
    public Boolean checkAvailability(UUID productId, UUID sizeId, Integer quantity, UUID businessId) {
        Optional<ProductStock> stockOpt = productStockRepository
            .findByProductIdAndProductSizeIdAndBusinessId(productId, sizeId, businessId);

        if (stockOpt.isEmpty()) {
            return true; // No stock record = product not tracked
        }

        ProductStock stock = stockOpt.get();

        if (stock.getIsExpired()) {
            return false; // Can't sell expired products
        }

        return stock.getQuantityAvailable() >= quantity;
    }

    @Override
    public Map<UUID, Boolean> checkBulkAvailability(Map<UUID, Integer> productQuantities, UUID businessId) {
        Map<UUID, Boolean> result = new HashMap<>();

        for (Map.Entry<UUID, Integer> entry : productQuantities.entrySet()) {
            UUID productId = entry.getKey();
            Integer quantity = entry.getValue();

            Optional<ProductStock> stock = productStockRepository
                .findByProductIdAndProductSizeIdAndBusinessId(productId, null, businessId);

            boolean available = stock.isEmpty() || (
                !stock.get().getIsExpired() &&
                stock.get().getQuantityAvailable() >= quantity
            );

            result.put(productId, available);
        }

        return result;
    }

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

        // Create adjustment record
        StockAdjustment adjustment = StockAdjustment.builder()
            .businessId(businessId)
            .productStockId(stock.getId())
            .adjustmentType(request.getAdjustmentType())
            .previousQuantity(previousQty)
            .adjustedQuantity(newQty)
            .quantityDifference(request.getAdjustmentQuantity())
            .reason(request.getReason())
            .detailNotes(request.getDetailNotes())
            .requiresApproval(request.getRequiresApproval() != null && request.getRequiresApproval())
            .approved(false)
            .adjustedBy(getCurrentUserId())
            .adjustedAt(LocalDateTime.now())
            .build();

        stockAdjustmentRepository.save(adjustment);

        // Update stock
        stock.setQuantityOnHand(newQty);
        stock.setDateIn(LocalDateTime.now());
        stock.setUpdatedBy(getCurrentUserId());
        productStockRepository.save(stock);

        // Create movement log
        StockMovement movement = createStockMovement(
            businessId,
            stock.getId(),
            "ADJUSTMENT",
            request.getAdjustmentQuantity(),
            previousQty,
            newQty,
            "ADJUSTMENT",
            adjustment.getId(),
            request.getReason(),
            getCurrentUserId(),
            null,
            null
        );

        // Check thresholds
        if (stock.getQuantityOnHand() <= stock.getMinimumStockLevel()) {
            createOrUpdateAlert(businessId, stock, "LOW_STOCK");
        }

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
        stock.setUpdatedBy(userId);
        productStockRepository.save(stock);

        StockMovement movement = createStockMovement(
            businessId,
            stock.getId(),
            "STOCK_IN",
            quantity,
            previousQty,
            newQty,
            null,
            null,
            reason,
            userId,
            null,
            stock.getPriceIn()
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

        if (newQty < -999) { // Allow slight oversell but not extreme
            throw new InvalidOperationException("Insufficient stock available");
        }

        stock.setQuantityOnHand(newQty);
        stock.setDateOut(LocalDateTime.now());
        stock.setUpdatedBy(getCurrentUserId());
        productStockRepository.save(stock);

        StockMovement movement = createStockMovement(
            businessId,
            stock.getId(),
            "STOCK_OUT",
            -quantity,
            previousQty,
            newQty,
            "ORDER",
            orderId,
            reason,
            getCurrentUserId(),
            orderId,
            stock.getPriceOut()
        );

        // Check for alerts
        if (newQty <= stock.getMinimumStockLevel()) {
            createOrUpdateAlert(businessId, stock, "LOW_STOCK");
        }
        if (newQty < 0) {
            createOrUpdateAlert(businessId, stock, "NEGATIVE_STOCK");
        }

        log.info("Stock deducted for order {}: {} units from product {}", orderId, quantity, stock.getProductId());
        return mapToDto(movement);
    }

    @Override
    public StockMovementDto returnStock(UUID businessId, UUID orderId, String reason) {
        // Find all stock movements for this order
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
                stock.setUpdatedBy(getCurrentUserId());
                productStockRepository.save(stock);

                createStockMovement(
                    businessId,
                    stock.getId(),
                    "RETURN",
                    returnQuantity,
                    stock.getQuantityOnHand() - returnQuantity,
                    newQty,
                    "ORDER",
                    orderId,
                    reason,
                    getCurrentUserId(),
                    orderId,
                    stock.getPriceOut()
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
        stock.setUpdatedBy(userId);
        productStockRepository.save(stock);

        StockMovement movement = createStockMovement(
            businessId,
            stock.getId(),
            "EXPIRY",
            0,
            stock.getQuantityOnHand(),
            stock.getQuantityOnHand(),
            null,
            null,
            reason,
            userId,
            null,
            stock.getPriceOut()
        );

        createOrUpdateAlert(businessId, stock, "EXPIRED");

        log.info("Stock marked as expired: product {}", stock.getProductId());
        return mapToDto(movement);
    }

    // ========== Barcode Operations ==========

    @Override
    public ProductStockDto getByBarcode(String barcode, UUID businessId) {
        ProductStock stock = productStockRepository.findByBarcodeAndBusinessId(barcode, businessId)
            .orElseThrow(() -> new ResourceNotFoundException("Barcode not found"));
        return mapToDto(stock);
    }

    @Override
    public ProductStockDto assignBarcode(UUID businessId, UUID productStockId, String barcode) {
        ProductStock stock = productStockRepository.findById(productStockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));

        validateBusinessOwnership(stock.getBusinessId(), businessId);

        stock.setBarcode(barcode);
        productStockRepository.save(stock);

        BarcodeMapping mapping = BarcodeMapping.builder()
            .businessId(businessId)
            .productStockId(productStockId)
            .barcode(barcode)
            .barcodeFormat("CODE128")
            .productId(stock.getProductId())
            .productSizeId(stock.getProductSizeId())
            .active(true)
            .createdBy(getCurrentUserId())
            .build();

        barcodeMappingRepository.save(mapping);

        log.info("Barcode assigned to product stock {}: {}", productStockId, barcode);
        return mapToDto(stock);
    }

    @Override
    public ProductStockDto removeBarcode(UUID businessId, UUID productStockId) {
        ProductStock stock = productStockRepository.findById(productStockId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));

        validateBusinessOwnership(stock.getBusinessId(), businessId);

        String barcode = stock.getBarcode();
        stock.setBarcode(null);
        productStockRepository.save(stock);

        if (barcode != null) {
            barcodeMappingRepository.findByBarcode(barcode).ifPresent(mapping -> {
                mapping.setActive(false);
                barcodeMappingRepository.save(mapping);
            });
        }

        log.info("Barcode removed from product stock {}", productStockId);
        return mapToDto(stock);
    }

    // ========== Stock Availability for Orders ==========

    @Override
    public List<ProductStockDto> validateOrderItems(UUID businessId, List<Map<String, Object>> orderItems) {
        List<ProductStockDto> result = new ArrayList<>();

        for (Map<String, Object> item : orderItems) {
            UUID productId = UUID.fromString(item.get("productId").toString());
            UUID sizeId = item.get("sizeId") != null ? UUID.fromString(item.get("sizeId").toString()) : null;
            Integer quantity = Integer.parseInt(item.get("quantity").toString());

            Optional<ProductStock> stockOpt = productStockRepository
                .findByProductIdAndProductSizeIdAndBusinessId(productId, sizeId, businessId);

            if (stockOpt.isPresent()) {
                ProductStock stock = stockOpt.get();
                ProductStockDto dto = mapToDto(stock);
                dto.setQuantityAvailable(stock.getQuantityAvailable());
                result.add(dto);
            }
        }

        return result;
    }

    @Override
    public void reserveStockForOrder(UUID businessId, UUID orderId, List<Map<String, Object>> orderItems) {
        for (Map<String, Object> item : orderItems) {
            UUID productId = UUID.fromString(item.get("productId").toString());
            UUID sizeId = item.get("sizeId") != null ? UUID.fromString(item.get("sizeId").toString()) : null;
            Integer quantity = Integer.parseInt(item.get("quantity").toString());

            Optional<ProductStock> stockOpt = productStockRepository
                .findByProductIdAndProductSizeIdAndBusinessId(productId, sizeId, businessId);

            if (stockOpt.isPresent()) {
                ProductStock stock = stockOpt.get();
                stock.setQuantityReserved(stock.getQuantityReserved() + quantity);
                productStockRepository.save(stock);
            }
        }
    }

    @Override
    public void fulfillStockForOrder(UUID businessId, UUID orderId) {
        List<StockMovement> movements = stockMovementRepository.findByOrderId(orderId);

        for (StockMovement movement : movements) {
            if ("RESERVED".equals(movement.getMovementType())) {
                ProductStock stock = productStockRepository.findById(movement.getProductStockId()).orElse(null);
                if (stock != null) {
                    stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - Math.abs(movement.getQuantityChange())));
                    productStockRepository.save(stock);
                }
            }
        }
    }

    @Override
    public void releaseStockForOrder(UUID businessId, UUID orderId) {
        List<StockMovement> movements = stockMovementRepository.findByOrderId(orderId);

        for (StockMovement movement : movements) {
            if ("RESERVED".equals(movement.getMovementType())) {
                ProductStock stock = productStockRepository.findById(movement.getProductStockId()).orElse(null);
                if (stock != null) {
                    stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - Math.abs(movement.getQuantityChange())));
                    productStockRepository.save(stock);
                }
            }
        }
    }

    // ========== Stock History & Audit ==========

    @Override
    public List<StockMovementDto> getStockHistory(UUID productStockId, LocalDateTime from, LocalDateTime to) {
        return stockMovementRepository.findByProductStockIdAndDateRange(productStockId, from, to)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public Page<StockMovementDto> getStockHistoryPaginated(
        UUID businessId,
        UUID productStockId,
        String movementType,
        LocalDateTime from,
        LocalDateTime to,
        Integer pageNo,
        Integer pageSize
    ) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);

        Page<StockMovement> movements;

        if (productStockId != null) {
            movements = stockMovementRepository.findByProductStockIdOrderByCreatedAtDesc(productStockId, pageable);
        } else {
            movements = stockMovementRepository.findByBusinessIdOrderByCreatedAtDesc(businessId, pageable);
        }

        return movements.map(this::mapToDto);
    }

    @Override
    public List<StockMovementDto> getBusinessStockHistory(UUID businessId, LocalDateTime from, LocalDateTime to) {
        return stockMovementRepository.findByBusinessIdAndDateRange(businessId, from, to, PageRequest.of(0, 1000))
            .getContent()
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    // ========== Alerts ==========

    @Override
    public List<StockAlertDto> getActiveAlerts(UUID businessId) {
        return stockAlertRepository.findActiveAlerts(businessId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<StockAlertDto> getAlertsByType(UUID businessId, String alertType) {
        return stockAlertRepository.findActiveAlertsByType(businessId, alertType)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<StockAlertDto> getCriticalAlerts(UUID businessId) {
        return stockAlertRepository.findCriticalAlerts(businessId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public StockAlertDto acknowledgeAlert(UUID businessId, UUID alertId, UUID userId) {
        StockAlert alert = stockAlertRepository.findById(alertId)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));

        validateBusinessOwnership(alert.getBusinessId(), businessId);

        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedBy(userId);
        alert.setAcknowledgedAt(LocalDateTime.now());
        stockAlertRepository.save(alert);

        return mapToDto(alert);
    }

    @Override
    public StockAlertDto resolveAlert(UUID businessId, UUID alertId) {
        StockAlert alert = stockAlertRepository.findById(alertId)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));

        validateBusinessOwnership(alert.getBusinessId(), businessId);

        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        stockAlertRepository.save(alert);

        return mapToDto(alert);
    }

    @Override
    public Long countActiveAlerts(UUID businessId) {
        return stockAlertRepository.countActiveAlerts(businessId);
    }

    // ========== Reports ==========

    @Override
    public Map<String, Object> getStockSummary(UUID businessId) {
        List<ProductStock> stocks = productStockRepository.findByBusinessId(businessId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalVariants", stocks.size());
        summary.put("totalItems", stocks.stream().mapToInt(ProductStock::getQuantityOnHand).sum());
        summary.put("lowStockCount", stocks.stream().filter(ProductStock::isLowStock).count());
        summary.put("outOfStockCount", stocks.stream().filter(ProductStock::isOutOfStock).count());
        summary.put("expiredCount", stocks.stream().filter(ProductStock::getIsExpired).count());
        summary.put("activeAlerts", countActiveAlerts(businessId));

        Optional<BigDecimal> costValue = productStockRepository.getTotalInventoryValue(businessId);
        Optional<BigDecimal> retailValue = productStockRepository.getTotalRetailValue(businessId);

        summary.put("totalCostValue", costValue.orElse(BigDecimal.ZERO));
        summary.put("totalRetailValue", retailValue.orElse(BigDecimal.ZERO));
        summary.put("potentialProfit", retailValue.orElse(BigDecimal.ZERO).subtract(costValue.orElse(BigDecimal.ZERO)));

        return summary;
    }

    @Override
    public Map<String, Object> getStockValuationReport(UUID businessId) {
        List<ProductStock> stocks = productStockRepository.findByBusinessId(businessId);

        Map<String, Object> report = new HashMap<>();

        BigDecimal totalCost = stocks.stream()
            .map(ProductStock::getInventoryValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRetail = stocks.stream()
            .map(ProductStock::getRetailValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        report.put("totalCostValue", totalCost);
        report.put("totalRetailValue", totalRetail);
        report.put("potentialProfit", totalRetail.subtract(totalCost));
        report.put("totalItems", stocks.stream().mapToInt(ProductStock::getQuantityOnHand).sum());
        report.put("totalVariants", stocks.size());

        return report;
    }

    @Override
    public Map<String, Object> getLowStockReport(UUID businessId) {
        List<ProductStock> lowStockProducts = productStockRepository.findLowStockProducts(businessId);

        Map<String, Object> report = new HashMap<>();
        report.put("criticalProducts", lowStockProducts.size());
        report.put("products", lowStockProducts.stream().map(this::mapToDto).collect(Collectors.toList()));

        List<Map<String, Object>> recommendations = lowStockProducts.stream()
            .map(stock -> {
                Map<String, Object> rec = new HashMap<>();
                rec.put("productId", stock.getProductId());
                rec.put("productName", stock.getProductId());
                rec.put("currentQuantity", stock.getQuantityOnHand());
                rec.put("recommendedOrder", stock.getUnitsToReorder());
                rec.put("estimatedCost", stock.getPriceIn().multiply(BigDecimal.valueOf(stock.getUnitsToReorder())));
                return rec;
            })
            .collect(Collectors.toList());

        report.put("recommendations", recommendations);
        return report;
    }

    @Override
    public Map<String, Object> getExpiryReport(UUID businessId) {
        Map<String, Object> report = new HashMap<>();

        report.put("expired", getExpiredProducts(businessId));
        report.put("expiring_7_days", getExpiringProducts(businessId, 7));
        report.put("expiring_30_days", getExpiringProducts(businessId, 30));

        return report;
    }

    @Override
    public Map<String, Object> getMovementReport(UUID businessId, LocalDateTime from, LocalDateTime to) {
        List<StockMovementDto> movements = getBusinessStockHistory(businessId, from, to);

        Map<String, Object> report = new HashMap<>();
        report.put("period_from", from);
        report.put("period_to", to);
        report.put("total_movements", movements.size());

        long inbound = movements.stream().filter(m -> "STOCK_IN".equals(m.getMovementType())).count();
        long outbound = movements.stream().filter(m -> "STOCK_OUT".equals(m.getMovementType())).count();

        report.put("inbound_count", inbound);
        report.put("outbound_count", outbound);

        return report;
    }

    // ========== Helper Methods ==========

    private StockMovement createStockMovement(
        UUID businessId,
        UUID productStockId,
        String movementType,
        Integer quantityChange,
        Integer previousQuantity,
        Integer newQuantity,
        String referenceType,
        UUID referenceId,
        String notes,
        UUID initiatedBy,
        UUID orderId,
        BigDecimal unitPrice
    ) {
        StockMovement movement = StockMovement.builder()
            .businessId(businessId)
            .productStockId(productStockId)
            .movementType(movementType)
            .quantityChange(quantityChange)
            .previousQuantity(previousQuantity)
            .newQuantity(newQuantity)
            .referenceType(referenceType)
            .referenceId(referenceId)
            .orderId(orderId)
            .notes(notes)
            .initiatedBy(initiatedBy)
            .unitPrice(unitPrice != null ? unitPrice : BigDecimal.ZERO)
            .costImpact(calculateCostImpact(quantityChange, unitPrice))
            .build();

        return stockMovementRepository.save(movement);
    }

    private void createOrUpdateAlert(UUID businessId, ProductStock stock, String alertType) {
        List<StockAlert> existingAlerts = stockAlertRepository.findExistingActiveAlert(stock.getId(), alertType);

        if (existingAlerts.isEmpty()) {
            StockAlert alert = StockAlert.builder()
                .businessId(businessId)
                .productStockId(stock.getId())
                .alertType(alertType)
                .productId(stock.getProductId())
                .productSizeId(stock.getProductSizeId())
                .currentQuantity(stock.getQuantityOnHand())
                .threshold(stock.getMinimumStockLevel())
                .expiryDate(stock.getExpiryDate())
                .daysUntilExpiry(stock.getDaysUntilExpiry())
                .status("ACTIVE")
                .notificationSent(false)
                .notificationType("NONE")
                .build();

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

    private ProductStockDto mapToDto(ProductStock stock) {
        ProductStockDto dto = new ProductStockDto();
        dto.setId(stock.getId());
        dto.setBusinessId(stock.getBusinessId());
        dto.setProductId(stock.getProductId());
        dto.setProductSizeId(stock.getProductSizeId());
        dto.setQuantityOnHand(stock.getQuantityOnHand());
        dto.setQuantityReserved(stock.getQuantityReserved());
        dto.setQuantityAvailable(stock.getQuantityAvailable());
        dto.setMinimumStockLevel(stock.getMinimumStockLevel());
        dto.setReorderQuantity(stock.getReorderQuantity());
        dto.setPriceIn(stock.getPriceIn());
        dto.setPriceOut(stock.getPriceOut());
        dto.setCostPerUnit(stock.getCostPerUnit());
        dto.setDateIn(stock.getDateIn());
        dto.setDateOut(stock.getDateOut());
        dto.setExpiryDate(stock.getExpiryDate());
        dto.setDaysUntilExpiry(stock.getDaysUntilExpiry());
        dto.setBarcode(stock.getBarcode());
        dto.setSku(stock.getSku());
        dto.setLocation(stock.getLocation());
        dto.setIsActive(stock.getIsActive());
        dto.setIsExpired(stock.getIsExpired());
        dto.setTrackInventory(stock.getTrackInventory());
        dto.setIsLowStock(stock.isLowStock());
        dto.setIsOutOfStock(stock.isOutOfStock());
        dto.setIsOverSold(stock.isOverSold());
        dto.setInventoryValue(stock.getInventoryValue());
        dto.setRetailValue(stock.getRetailValue());
        dto.setPotentialProfit(stock.getPotentialProfit());
        dto.setUnitsToReorder(stock.getUnitsToReorder());
        dto.setCreatedAt(stock.getCreatedAt());
        dto.setUpdatedAt(stock.getUpdatedAt());

        return dto;
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
        dto.setApprovedBy(movement.getApprovedBy());
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
