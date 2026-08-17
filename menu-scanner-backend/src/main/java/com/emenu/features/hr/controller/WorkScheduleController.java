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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/work-schedule")
@RequiredArgsConstructor
@Slf4j
public class WorkScheduleController {

    private final WorkScheduleService service;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> create(
            @Valid @RequestBody WorkScheduleCreateRequest request) {
        log.info("Endpoint: create-work-schedule - creation request received: name={}, userId={}, dayShiftsCount={}",
                request.getName(), request.getUserId(), request.getDayShifts() != null ? request.getDayShifts().size() : 0);
        WorkScheduleResponse response = service.create(request);
        log.info("Endpoint: create-work-schedule - creation success: id={}, name={}", response.getId(), response.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work schedule created", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> getById(@PathVariable UUID id) {
        log.info("Endpoint: get-work-schedule - detail request received: id={}", id);
        WorkScheduleResponse response = service.getById(id);
        log.info("Endpoint: get-work-schedule - detail retrieval success: id={}, name={}, dayShiftsCount={}",
                response.getId(), response.getName(), response.getDayShifts() != null ? response.getDayShifts().size() : 0);
        return ResponseEntity.ok(ApiResponse.success("Work schedule retrieved", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<WorkScheduleResponse>>> getAll(
            @Valid @RequestBody WorkScheduleFilterRequest filter) {
        log.info("Endpoint: search-work-schedules - retrieval request received: page={}, size={}, businessId={}, userId={}",
                filter.getPageNo(), filter.getPageSize(), filter.getBusinessId(), filter.getUserId());
        PaginationResponse<WorkScheduleResponse> response = service.getAll(filter);
        log.info("Endpoint: search-work-schedules - retrieval success: totalElements={}", response != null ? response.getTotalElements() : 0);
        return ResponseEntity.ok(ApiResponse.success("Work schedules retrieved", response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<WorkScheduleResponse>>> getByUserId(@PathVariable UUID userId) {
        log.info("Endpoint: get-work-schedules-by-user - retrieval request received: userId={}", userId);
        List<WorkScheduleResponse> responses = service.getByUserId(userId);
        log.info("Endpoint: get-work-schedules-by-user - retrieval success: count={}", responses.size());
        return ResponseEntity.ok(ApiResponse.success("Work schedules retrieved", responses));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody WorkScheduleUpdateRequest request) {
        log.info("Endpoint: update-work-schedule - update request received: id={}, name={}, dayShiftsCount={}",
                id, request.getName(), request.getDayShifts() != null ? request.getDayShifts().size() : 0);
        WorkScheduleResponse response = service.update(id, request);
        log.info("Endpoint: update-work-schedule - update success: id={}, name={}, dayShiftsCount={}",
                response.getId(), response.getName(), response.getDayShifts() != null ? response.getDayShifts().size() : 0);
        return ResponseEntity.ok(ApiResponse.success("Work schedule updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> delete(@PathVariable UUID id) {
        log.info("Endpoint: delete-work-schedule - deletion request received: id={}", id);
        WorkScheduleResponse response = service.delete(id);
        log.info("Endpoint: delete-work-schedule - deletion success: id={}", response.getId());
        return ResponseEntity.ok(ApiResponse.success("Work schedule deleted", response));
    }
}