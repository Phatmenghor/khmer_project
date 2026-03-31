
package com.emenu.features.setting.controller;

import com.emenu.features.setting.dto.filter.ConfigEnumFilterRequest;
import com.emenu.features.setting.dto.request.LeaveTypeEnumCreateRequest;
import com.emenu.features.setting.dto.response.LeaveTypeEnumResponse;
import com.emenu.features.setting.dto.update.LeaveTypeEnumUpdateRequest;
import com.emenu.features.setting.service.LeaveTypeEnumService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enums/leave-type")
@RequiredArgsConstructor
public class LeaveTypeEnumController {

    private final LeaveTypeEnumService service;

    /**
     * Creates a new leave type enum
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LeaveTypeEnumResponse>> create(
            @Valid @RequestBody LeaveTypeEnumCreateRequest request) {
        LeaveTypeEnumResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave type enum created", response));
    }

    /**
     * Retrieves a leave type enum by its ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveTypeEnumResponse>> getById(@PathVariable UUID id) {
        LeaveTypeEnumResponse response = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Leave type enum retrieved", response));
    }

    /**
     * Retrieves all leave type enums with pagination and filtering
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<LeaveTypeEnumResponse>>> getAll(
            @Valid @RequestBody ConfigEnumFilterRequest filter) {
        PaginationResponse<LeaveTypeEnumResponse> response = service.getAll(filter);
        return ResponseEntity.ok(ApiResponse.success("Leave type enums retrieved", response));
    }

    /**
     * Retrieves all leave type enums as a simple list
     */
    @PostMapping("/all-list")
    public ResponseEntity<ApiResponse<List<LeaveTypeEnumResponse>>> getAllList(
            @Valid @RequestBody ConfigEnumFilterRequest filter) {
        List<LeaveTypeEnumResponse> response = service.getAllList(filter);
        return ResponseEntity.ok(ApiResponse.success("Leave type enums retrieved", response));
    }

    /**
     * Retrieves leave type enums for a specific business
     */
    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<LeaveTypeEnumResponse>>> getByBusinessId(
            @PathVariable UUID businessId) {
        List<LeaveTypeEnumResponse> responses = service.getByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Leave type enums retrieved", responses));
    }

    /**
     * Updates a leave type enum
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveTypeEnumResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody LeaveTypeEnumUpdateRequest request) {
        LeaveTypeEnumResponse response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Leave type enum updated", response));
    }

    /**
     * Deletes a leave type enum
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveTypeEnumResponse>> delete(@PathVariable UUID id) {
        LeaveTypeEnumResponse response = service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Leave type enum deleted", response));
    }
}