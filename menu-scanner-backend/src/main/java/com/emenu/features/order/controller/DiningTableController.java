package com.emenu.features.order.controller;

import com.emenu.enums.order.TableStatus;
import com.emenu.features.order.dto.filter.DiningTableFilterRequest;
import com.emenu.features.order.dto.request.CreateTableRequest;
import com.emenu.features.order.dto.request.UpdateTableStatusRequest;
import com.emenu.features.order.dto.response.DiningTableResponse;
import com.emenu.features.order.service.DiningTableService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
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
public class DiningTableController {

    private final DiningTableService tableService;
    private final SecurityUtils securityUtils;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<List<DiningTableResponse>>> getAllTables(
            @Valid @RequestBody DiningTableFilterRequest filterRequestData) {
        log.info("Endpoint: all - dining tables list retrieval request received: business_id={}, status={}",
                filterRequestData.getBusinessId(), filterRequestData.getStatus());
        UUID businessId = filterRequestData.getBusinessId() != null
                ? filterRequestData.getBusinessId()
                : securityUtils.getCurrentUserBusinessId();
        List<DiningTableResponse> tables = tableService.getTablesByBusiness(businessId, filterRequestData.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Tables retrieved successfully", tables));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<List<DiningTableResponse>>> getMyBusinessTables(
            @Valid @RequestBody DiningTableFilterRequest filterRequestData) {
        log.info("Endpoint: my-business/all - business tables list retrieval request received: status={}",
                filterRequestData.getStatus());
        UUID businessIdContext = securityUtils.getCurrentUserBusinessId();
        filterRequestData.setBusinessId(businessIdContext);
        List<DiningTableResponse> tables = tableService.getTablesByBusiness(businessIdContext, filterRequestData.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Business tables retrieved successfully", tables));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiningTableResponse>> getTableById(@PathVariable UUID id) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: getTableById - dining table details retrieval request received: table_id={}, business_id={}", id, businessId);
        DiningTableResponse table = tableService.getTableById(businessId, id);
        return ResponseEntity.ok(ApiResponse.success("Table retrieved successfully", table));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DiningTableResponse>> createTable(
            @Valid @RequestBody CreateTableRequest createRequestData) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: createTable - dining table creation request received: number={}, zone={}, business_id={}",
                createRequestData.getNumber(), createRequestData.getZone(), businessId);
        DiningTableResponse response = tableService.createTable(businessId, createRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Table created successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DiningTableResponse>> updateTableStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTableStatusRequest updateStatusRequestData) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: updateTableStatus - dining table status update request received: table_id={}, new_status={}, business_id={}",
                id, updateStatusRequestData.getStatus(), businessId);
        DiningTableResponse response = tableService.updateTableStatus(businessId, id, updateStatusRequestData);
        return ResponseEntity.ok(ApiResponse.success("Table status updated successfully", response));
    }

    @PostMapping("/{id}/reset")
    public ResponseEntity<ApiResponse<DiningTableResponse>> resetTable(@PathVariable UUID id) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: resetTable - dining table reset request received: table_id={}, business_id={}", id, businessId);
        DiningTableResponse response = tableService.resetTable(businessId, id);
        return ResponseEntity.ok(ApiResponse.success("Table reset to AVAILABLE successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable UUID id) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: deleteTable - dining table deletion request received: table_id={}, business_id={}", id, businessId);
        tableService.deleteTable(businessId, id);
        return ResponseEntity.ok(ApiResponse.success("Table deleted successfully", null));
    }
}
