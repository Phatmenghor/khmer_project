package com.emenu.features.hr.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.hr.dto.filter.LeaveFilterRequest;
import com.emenu.features.hr.dto.request.LeaveApprovalRequest;
import com.emenu.features.hr.dto.request.LeaveCreateRequest;
import com.emenu.features.hr.dto.response.LeaveBalanceResponse;
import com.emenu.features.hr.dto.response.LeaveResponse;
import com.emenu.features.hr.dto.update.LeaveUpdateRequest;
import com.emenu.features.hr.service.LeaveService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService service;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveResponse>> create(@Valid @RequestBody LeaveCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        LeaveResponse response = service.create(request, currentUser.getId(), currentUser.getBusinessId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave request created", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveResponse>> getById(@PathVariable UUID id) {
        LeaveResponse response = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Leave request retrieved", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<LeaveResponse>>> getAll(
            @Valid @RequestBody LeaveFilterRequest filter) {
        PaginationResponse<LeaveResponse> response = service.getAll(filter);
        return ResponseEntity.ok(ApiResponse.success("Leave requests retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody LeaveUpdateRequest request) {
        LeaveResponse response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Leave request updated", response));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveResponse>> approve(
            @PathVariable UUID id,
            @Valid @RequestBody LeaveApprovalRequest request) {
        UUID actionBy = securityUtils.getCurrentUserId();
        LeaveResponse response = service.approve(id, request, actionBy);
        return ResponseEntity.ok(ApiResponse.success("Leave request processed", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveResponse>> delete(@PathVariable UUID id) {
        LeaveResponse response = service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Leave request deleted", response));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> getMyLeaveBalance() {
        User currentUser = securityUtils.getCurrentUser();
        LeaveBalanceResponse response = service.getLeaveBalance(currentUser.getId(), currentUser.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("My leave balance retrieved", response));
    }

    @GetMapping("/balance/{userId}")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> getUserLeaveBalance(@PathVariable UUID userId) {
        User currentUser = securityUtils.getCurrentUser();
        LeaveBalanceResponse response = service.getLeaveBalance(userId, currentUser.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("User leave balance retrieved", response));
    }
}