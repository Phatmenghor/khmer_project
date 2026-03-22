package com.emenu.features.stock.service;

import com.emenu.features.stock.dto.request.StockAdjustmentRequest;
import com.emenu.features.stock.dto.request.StockQueryRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.StockAlertDto;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.models.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface StockService {

    // ========== Stock Query Operations ==========
    ProductStockDto getStockByProductAndSize(UUID productId, UUID sizeId, UUID businessId);

    ProductStockDto getStockById(UUID stockId);

    List<ProductStockDto> getAllStockByBusiness(UUID businessId);

    List<ProductStockDto> getLowStockProducts(UUID businessId);

    List<ProductStockDto> getExpiredProducts(UUID businessId);

    List<ProductStockDto> getExpiringProducts(UUID businessId, Integer daysAhead);

    Page<ProductStockDto> searchStock(StockQueryRequest request);

    // ========== Stock Availability Checks ==========
    Boolean checkAvailability(UUID productId, UUID sizeId, Integer quantity, UUID businessId);

    Map<UUID, Boolean> checkBulkAvailability(Map<UUID, Integer> productQuantities, UUID businessId);

    // ========== Stock Adjustment Operations ==========
    StockMovementDto adjustStock(UUID businessId, StockAdjustmentRequest request);

    StockMovementDto addStock(UUID businessId, UUID productStockId, Integer quantity, String reason, UUID userId);

    StockMovementDto deductStock(UUID businessId, UUID productStockId, Integer quantity, UUID orderId, String reason);

    StockMovementDto returnStock(UUID businessId, UUID orderId, String reason);

    StockMovementDto markExpired(UUID businessId, UUID productStockId, String reason, UUID userId);

    // ========== Barcode Operations ==========
    ProductStockDto getByBarcode(String barcode, UUID businessId);

    ProductStockDto assignBarcode(UUID businessId, UUID productStockId, String barcode);

    ProductStockDto removeBarcode(UUID businessId, UUID productStockId);

    // ========== Stock Availability for Orders ==========
    List<ProductStockDto> validateOrderItems(UUID businessId, List<Map<String, Object>> orderItems);

    void reserveStockForOrder(UUID businessId, UUID orderId, List<Map<String, Object>> orderItems);

    void fulfillStockForOrder(UUID businessId, UUID orderId);

    void releaseStockForOrder(UUID businessId, UUID orderId);

    // ========== Stock History & Audit ==========
    List<StockMovementDto> getStockHistory(UUID productStockId, LocalDateTime from, LocalDateTime to);

    Page<StockMovementDto> getStockHistoryPaginated(
        UUID businessId,
        UUID productStockId,
        String movementType,
        LocalDateTime from,
        LocalDateTime to,
        Integer pageNo,
        Integer pageSize
    );

    List<StockMovementDto> getBusinessStockHistory(
        UUID businessId,
        LocalDateTime from,
        LocalDateTime to
    );

    // ========== Alerts ==========
    List<StockAlertDto> getActiveAlerts(UUID businessId);

    List<StockAlertDto> getAlertsByType(UUID businessId, String alertType);

    List<StockAlertDto> getCriticalAlerts(UUID businessId);

    StockAlertDto acknowledgeAlert(UUID businessId, UUID alertId, UUID userId);

    StockAlertDto resolveAlert(UUID businessId, UUID alertId);

    Long countActiveAlerts(UUID businessId);

    // ========== Reports ==========
    Map<String, Object> getStockSummary(UUID businessId);

    Map<String, Object> getStockValuationReport(UUID businessId);

    Map<String, Object> getLowStockReport(UUID businessId);

    Map<String, Object> getExpiryReport(UUID businessId);

    Map<String, Object> getMovementReport(UUID businessId, LocalDateTime from, LocalDateTime to);
}
