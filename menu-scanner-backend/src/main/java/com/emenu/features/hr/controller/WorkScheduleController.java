package com.emenu.features.hr.controller;

import com.emenu.features.hr.dto.filter.WorkScheduleFilterRequest;
import com.emenu.features.hr.dto.request.WorkScheduleCreateRequest;
import com.emenu.features.hr.dto.response.WorkScheduleResponse;
import com.emenu.features.hr.dto.update.WorkScheduleUpdateRequest;
import com.emenu.features.hr.service.WorkScheduleService;
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
@RequestMapping("/api/v1/hr/work-schedule")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final WorkScheduleService service;

    /**
     * Creates a new work schedule
     */
    @PostMapping
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> create(
            @Valid @RequestBody WorkScheduleCreateRequest request) {
        WorkScheduleResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work schedule created", response));
    }

    /**
     * Retrieves a work schedule by its ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> getById(@PathVariable UUID id) {
        WorkScheduleResponse response = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Work schedule retrieved", response));
    }

    /**
     * Retrieves all work schedules with pagination and filtering
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<WorkScheduleResponse>>> getAll(
            @Valid @RequestBody WorkScheduleFilterRequest filter) {
        PaginationResponse<WorkScheduleResponse> response = service.getAll(filter);
        return ResponseEntity.ok(ApiResponse.success("Work schedules retrieved", response));
    }

    /**
     * Retrieves all work schedules for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<WorkScheduleResponse>>> getByUserId(
            @PathVariable UUID userId) {
        List<WorkScheduleResponse> responses = service.getByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Work schedules retrieved", responses));
    }

    /**
     * Updates a work schedule
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody WorkScheduleUpdateRequest request) {
        WorkScheduleResponse response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Work schedule updated", response));
    }

    /**
     * Deletes a work schedule
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> delete(@PathVariable UUID id) {
        WorkScheduleResponse response = service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Work schedule deleted", response));
    }
}