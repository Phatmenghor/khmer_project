package com.emenu.features.setting.controller;

import com.emenu.features.setting.dto.filter.ConfigEnumFilterRequest;
import com.emenu.features.setting.dto.request.WorkScheduleTypeEnumCreateRequest;
import com.emenu.features.setting.dto.response.WorkScheduleTypeEnumResponse;
import com.emenu.features.setting.dto.update.WorkScheduleTypeEnumUpdateRequest;
import com.emenu.features.setting.service.WorkScheduleTypeEnumService;
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
@RequestMapping("/api/v1/enums/work-schedule-type")
@RequiredArgsConstructor
public class WorkScheduleTypeEnumController {

    private final WorkScheduleTypeEnumService service;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkScheduleTypeEnumResponse>> create(
            @Valid @RequestBody WorkScheduleTypeEnumCreateRequest request) {
        WorkScheduleTypeEnumResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work schedule type enum created", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleTypeEnumResponse>> getById(@PathVariable UUID id) {
        WorkScheduleTypeEnumResponse response = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Work schedule type enum retrieved", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<WorkScheduleTypeEnumResponse>>> getAll(
            @Valid @RequestBody ConfigEnumFilterRequest filter) {
        PaginationResponse<WorkScheduleTypeEnumResponse> response = service.getAll(filter);
        return ResponseEntity.ok(ApiResponse.success("Work schedule type enums retrieved", response));
    }

    @PostMapping("/all-list")
    public ResponseEntity<ApiResponse<List<WorkScheduleTypeEnumResponse>>> getAllList(
            @Valid @RequestBody ConfigEnumFilterRequest filter) {
        List<WorkScheduleTypeEnumResponse> response = service.getAllList(filter);
        return ResponseEntity.ok(ApiResponse.success("Work schedule type enums retrieved", response));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<WorkScheduleTypeEnumResponse>>> getByBusinessId(
            @PathVariable UUID businessId) {
        List<WorkScheduleTypeEnumResponse> responses = service.getByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Work schedule type enums retrieved", responses));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleTypeEnumResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody WorkScheduleTypeEnumUpdateRequest request) {
        WorkScheduleTypeEnumResponse response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Work schedule type enum updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleTypeEnumResponse>> delete(@PathVariable UUID id) {
        WorkScheduleTypeEnumResponse response = service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Work schedule type enum deleted", response));
    }
}