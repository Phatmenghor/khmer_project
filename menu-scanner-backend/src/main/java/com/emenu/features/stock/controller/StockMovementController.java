package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.request.StockMovementFilterRequest;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.service.StockService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stock/history")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockService stockService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<StockMovementDto>>> getAllMovements(
            @Valid @RequestBody StockMovementFilterRequest request) {
        PaginationResponse<StockMovementDto> result = stockService.getAllMovements(request);
        return ResponseEntity.ok(ApiResponse.success("Stock movements retrieved", result));
    }
}
