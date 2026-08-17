package com.emenu.features.order.controller;

import com.emenu.features.order.dto.filter.TableSessionFilterRequest;
import com.emenu.features.order.dto.request.AddTableSessionItemRequest;
import com.emenu.features.order.dto.request.SettleTableSessionRequest;
import com.emenu.features.order.dto.response.TableSessionResponse;
import com.emenu.features.order.service.TableSessionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/table-sessions")
@RequiredArgsConstructor
@Slf4j
public class TableSessionController {

    private final TableSessionService tableSessionService;
    private final SecurityUtils securityUtils;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<?>>> getAllTableSessions(
            @Valid @RequestBody TableSessionFilterRequest filterRequestData) {
        log.info("Endpoint: all - table sessions list retrieval request received: page={}",
                filterRequestData.getPageNo());
        if (filterRequestData.getBusinessId() == null) {
            filterRequestData.setBusinessId(securityUtils.getCurrentUserBusinessId());
        }
        PaginationResponse<?> response = tableSessionService.searchTableSessions(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Table sessions retrieved successfully", response));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<?>>> getMyBusinessTableSessions(
            @Valid @RequestBody TableSessionFilterRequest filterRequestData) {
        log.info("Endpoint: my-business/all - business table sessions list retrieval request received: page={}",
                filterRequestData.getPageNo());
        filterRequestData.setBusinessId(securityUtils.getCurrentUserBusinessId());
        PaginationResponse<?> response = tableSessionService.searchTableSessions(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Business table sessions retrieved successfully", response));
    }

    @GetMapping("/all-active")
    public ResponseEntity<ApiResponse<List<TableSessionResponse>>> getAllActiveSessions() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: all-active - active table sessions list retrieval: business_id={}", businessId);
        List<TableSessionResponse> response = tableSessionService.getAllActiveSessions(businessId);
        return ResponseEntity.ok(ApiResponse.success("Active table sessions retrieved successfully", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<TableSessionResponse>> getActiveSessionByTableId(@RequestParam String tableId) {
        log.info("Endpoint: active - active table session by tableId retrieval: table_id={}", tableId);
        UUID parsedUuid;
        try {
            parsedUuid = UUID.fromString(tableId);
        } catch (Exception ignored) {
            parsedUuid = UUID.nameUUIDFromBytes(("TABLE-" + tableId).getBytes());
        }
        TableSessionResponse response = tableSessionService.getActiveSessionByTableId(parsedUuid);
        return ResponseEntity.ok(ApiResponse.success("Active table session retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableSessionResponse>> getTableSessionById(@PathVariable UUID id) {
        log.info("Endpoint: getTableSessionById - table session details retrieval request received: session_id={}", id);
        TableSessionResponse response = tableSessionService.getSessionById(id);
        return ResponseEntity.ok(ApiResponse.success("Table session retrieved successfully", response));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<TableSessionResponse>> addItemToSession(
            @Valid @RequestBody AddTableSessionItemRequest addRequestData) {
        log.info("Endpoint: items - add session item request received: product_name={}", addRequestData.getProductName());
        UUID businessId = addRequestData.getBusinessId() != null
                ? addRequestData.getBusinessId()
                : securityUtils.getCurrentUserBusinessId();
        TableSessionResponse response = tableSessionService.addItemToSession(businessId, addRequestData);
        return ResponseEntity.ok(ApiResponse.success("Item added to table session successfully", response));
    }

    @PostMapping("/batch-items")
    public ResponseEntity<ApiResponse<TableSessionResponse>> addBatchItemsToSession(
            @Valid @RequestBody com.emenu.features.order.dto.request.AddTableSessionBatchItemsRequest batchRequestData) {
        log.info("Endpoint: batch-items - add batch session items request received: items_count={}",
                batchRequestData.getItems() != null ? batchRequestData.getItems().size() : 0);
        UUID businessId = batchRequestData.getBusinessId() != null
                ? batchRequestData.getBusinessId()
                : securityUtils.getCurrentUserBusinessId();
        TableSessionResponse response = tableSessionService.addBatchItemsToSession(businessId, batchRequestData);
        return ResponseEntity.ok(ApiResponse.success("Items added to table session successfully", response));
    }

    @PostMapping("/settle")
    public ResponseEntity<ApiResponse<TableSessionResponse>> settleSessionAndCreateOrder(
            @Valid @RequestBody SettleTableSessionRequest settleRequestData) {
        log.info("Endpoint: settle - settle table session request received: table_id={}, payment_method={}",
                settleRequestData.getTableId(), settleRequestData.getPaymentMethod());
        UUID businessId = settleRequestData.getBusinessId() != null
                ? settleRequestData.getBusinessId()
                : securityUtils.getCurrentUserBusinessId();
        TableSessionResponse response = tableSessionService.settleSessionAndCreateOrder(businessId, settleRequestData);
        return ResponseEntity.ok(ApiResponse.success("Table bill settled and order created successfully", response));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<TableSessionResponse>> approveTableSession(
            @PathVariable UUID id,
            @RequestParam(required = false) Integer round) {
        log.info("Endpoint: approveTableSession - table session approval request received: session_id={}, round={}", id, round);
        TableSessionResponse response = tableSessionService.approveSession(id, round);
        return ResponseEntity.ok(ApiResponse.success("Table session round approved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTableSession(@PathVariable UUID id) {
        log.info("Endpoint: deleteTableSession - table session deletion request received: session_id={}", id);
        tableSessionService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success("Table session deleted successfully", null));
    }
}
