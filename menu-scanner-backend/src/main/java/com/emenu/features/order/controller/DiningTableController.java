package com.emenu.features.order.controller;

import com.emenu.features.order.dto.request.CreateTableRequest;
import com.emenu.features.order.dto.request.UpdateTableStatusRequest;
import com.emenu.features.order.dto.response.DiningTableResponse;
import com.emenu.features.order.enums.TableStatus;
import com.emenu.features.order.service.DiningTableService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/tables")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dining Tables Management", description = "Admin APIs for Floor Plan & Table Monitoring")
public class DiningTableController {

    private final DiningTableService tableService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all dining tables for current logged-in business")
    public ResponseEntity<ApiResponse<List<DiningTableResponse>>> getTables(
            @RequestParam(required = false) TableStatus status
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: get-tables - fetching tables for businessId={}, statusFilter={}", businessId, status);
        List<DiningTableResponse> tables = tableService.getTablesByBusiness(businessId, status);
        log.info("Endpoint: get-tables - returned count={} tables for businessId={}", tables.size(), businessId);
        return ResponseEntity.ok(ApiResponse.success("Tables retrieved successfully", tables));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dining table details by ID")
    public ResponseEntity<ApiResponse<DiningTableResponse>> getTableById(@PathVariable UUID id) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: get-table-by-id - id={}, businessId={}", id, businessId);
        DiningTableResponse table = tableService.getTableById(businessId, id);
        log.info("Endpoint: get-table-by-id - detail returned for table id={}", id);
        return ResponseEntity.ok(ApiResponse.success("Table retrieved successfully", table));
    }

    @PostMapping
    @Operation(summary = "Create a new dining table or room")
    public ResponseEntity<ApiResponse<DiningTableResponse>> createTable(
            @Valid @RequestBody CreateTableRequest request
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: create-table - creating table: number={}, zone={}, businessId={}",
                request.getNumber(), request.getZone(), businessId);
        DiningTableResponse response = tableService.createTable(businessId, request);
        log.info("Endpoint: create-table - created successfully: tableId={}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Table created successfully", response));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update dining table status (AVAILABLE, OCCUPIED, UNPAID, PAID, RESERVED)")
    public ResponseEntity<ApiResponse<DiningTableResponse>> updateTableStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTableStatusRequest request
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: update-table-status - id={}, newStatus={}, businessId={}", id, request.getStatus(), businessId);
        DiningTableResponse response = tableService.updateTableStatus(businessId, id, request);
        log.info("Endpoint: update-table-status - table status updated successfully for id={}", id);
        return ResponseEntity.ok(ApiResponse.success("Table status updated successfully", response));
    }

    @PostMapping("/{id}/reset")
    @Operation(summary = "Reset dining table to AVAILABLE status")
    public ResponseEntity<ApiResponse<DiningTableResponse>> resetTable(@PathVariable UUID id) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: reset-table - resetting table id={} for businessId={}", id, businessId);
        DiningTableResponse response = tableService.resetTable(businessId, id);
        log.info("Endpoint: reset-table - table reset successfully for id={}", id);
        return ResponseEntity.ok(ApiResponse.success("Table reset to AVAILABLE successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete dining table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable UUID id) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: delete-table - deleting table id={} for businessId={}", id, businessId);
        tableService.deleteTable(businessId, id);
        log.info("Endpoint: delete-table - table deleted successfully for id={}", id);
        return ResponseEntity.ok(ApiResponse.success("Table deleted successfully", null));
    }
}
