package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.service.StockService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stock/history")
@RequiredArgsConstructor
@Slf4j
public class StockHistoryController {

    private final StockService stockService;

    @PostMapping("/product/{productStockId}")
    public ResponseEntity<ApiResponse<List<StockMovementDto>>> getProductHistory(
        @PathVariable UUID productStockId,
        @RequestParam(required = false) LocalDateTime from,
        @RequestParam(required = false) LocalDateTime to
    ) {
        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("Getting history for product stock: {} from: {} to: {}", productStockId, fromDate, toDate);
        List<StockMovementDto> result = stockService.getStockHistory(productStockId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(result, "Stock history retrieved"));
    }

    @PostMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<Page<StockMovementDto>>> getBusinessHistory(
        @PathVariable UUID businessId,
        @RequestParam(required = false) LocalDateTime from,
        @RequestParam(required = false) LocalDateTime to,
        @RequestParam(required = false) String movementType,
        @RequestParam(defaultValue = "1") Integer pageNo,
        @RequestParam(defaultValue = "50") Integer pageSize
    ) {
        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("Getting history for business: {} type: {} from: {} to: {}",
            businessId, movementType, fromDate, toDate);

        Page<StockMovementDto> result = stockService.getStockHistoryPaginated(
            businessId, null, movementType, fromDate, toDate, pageNo, pageSize
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Business stock history retrieved"));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<StockMovementDto>>> searchHistory(
        @RequestParam UUID businessId,
        @RequestParam(required = false) UUID productStockId,
        @RequestParam(required = false) String movementType,
        @RequestParam(required = false) LocalDateTime from,
        @RequestParam(required = false) LocalDateTime to,
        @RequestParam(defaultValue = "1") Integer pageNo,
        @RequestParam(defaultValue = "50") Integer pageSize
    ) {
        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(3);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("Searching history - business: {}, product: {}, type: {}",
            businessId, productStockId, movementType);

        Page<StockMovementDto> result = stockService.getStockHistoryPaginated(
            businessId, productStockId, movementType, fromDate, toDate, pageNo, pageSize
        );
        return ResponseEntity.ok(ApiResponse.success(result, "History search completed"));
    }

    @PostMapping("/export")
    public ResponseEntity<ApiResponse<List<StockMovementDto>>> exportHistory(
        @RequestParam UUID businessId,
        @RequestParam(required = false) LocalDateTime from,
        @RequestParam(required = false) LocalDateTime to
    ) {
        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("Exporting history for business: {} from: {} to: {}", businessId, fromDate, toDate);
        List<StockMovementDto> result = stockService.getBusinessStockHistory(businessId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(result, "History exported"));
    }
}
