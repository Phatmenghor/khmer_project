package com.emenu.features.stock.service;

import com.emenu.features.stock.dto.request.StockAlertFilterRequest;
import com.emenu.features.stock.dto.request.StockMovementFilterRequest;
import com.emenu.features.stock.dto.response.StockAlertDto;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.shared.dto.PaginationResponse;

import java.util.UUID;

public interface StockService {

    StockMovementDto addStock(UUID businessId, UUID productStockId, Integer quantity, String reason, UUID userId);

    StockMovementDto deductStock(UUID businessId, UUID productStockId, Integer quantity, UUID orderId, String reason);

    StockMovementDto returnStock(UUID businessId, UUID orderId, String reason);

    StockMovementDto markExpired(UUID businessId, UUID productStockId, String reason, UUID userId);

    PaginationResponse<StockAlertDto> getAllAlerts(StockAlertFilterRequest request);

    Long countActiveAlerts(UUID businessId);

    PaginationResponse<StockMovementDto> getAllMovements(StockMovementFilterRequest request);
}
