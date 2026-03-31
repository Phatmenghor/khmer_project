package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.RoleFilterRequest;
import com.emenu.features.auth.dto.request.RoleCreateRequest;
import com.emenu.features.auth.dto.response.RoleDetailResponse;
import com.emenu.features.auth.dto.response.RoleResponse;
import com.emenu.features.auth.dto.update.RoleUpdateRequest;
import com.emenu.features.auth.service.RoleService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Role Management Controller
 * Provides CRUD endpoints for role management.
 * Supports filtering by businessId, userTypes, search, and includeAll (soft-deleted).
 */
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final SecurityUtils securityUtils;

    /**
     * Create a new role (platform-level or business-specific)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(
            @Valid @RequestBody RoleCreateRequest request) {
        RoleResponse response = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role created successfully", response));
    }

    /**
     * Get all roles with filtering and pagination
     * Filter options: businessId, userTypes, search, includeAll
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<RoleResponse>>> getAllRoles(
            @Valid @RequestBody RoleFilterRequest request) {
        PaginationResponse<RoleResponse> response = roleService.getAllRoles(request);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", response));
    }

    /**
     * Get all roles as list with filtering (no pagination)
     * Filter options: businessId, userTypes, search, includeAll
     */
    @PostMapping("/all-list")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRolesList(
            @Valid @RequestBody RoleFilterRequest request) {
        List<RoleResponse> response = roleService.getAllRolesList(request);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", response));
    }

    /**
     * Get current business roles with pagination - Business ID extracted from token
     * Security: No businessId parameter needed, extracted from authenticated user's context
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<RoleResponse>>> getMyBusinessRoles(
            @Valid @RequestBody RoleFilterRequest request) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        request.setBusinessId(businessId);
        PaginationResponse<RoleResponse> response = roleService.getAllRoles(request);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", response));
    }

    /**
     * Get current business roles as list - Business ID extracted from token
     * Security: No businessId parameter needed, extracted from authenticated user's context
     */
    @PostMapping("/my-business/all-list")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getMyBusinessRolesList(
            @Valid @RequestBody RoleFilterRequest request) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        request.setBusinessId(businessId);
        List<RoleResponse> response = roleService.getAllRolesList(request);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", response));
    }

    /**
     * Get a role by ID
     */
    @GetMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleDetailResponse>> getRoleById(
            @PathVariable UUID roleId) {
        RoleDetailResponse response = roleService.getRoleById(roleId);
        return ResponseEntity.ok(ApiResponse.success("Role retrieved", response));
    }

    /**
     * Update a role
     * Cannot update system roles (PLATFORM_OWNER, BUSINESS_OWNER, CUSTOMER)
     */
    @PutMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable UUID roleId,
            @Valid @RequestBody RoleUpdateRequest request) {
        RoleResponse response = roleService.updateRole(roleId, request);
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", response));
    }

    /**
     * Delete a role (soft delete)
     * Cannot delete system roles
     * Does not affect current users - owners can update users themselves
     */
    @DeleteMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleResponse>> deleteRole(
            @PathVariable UUID roleId) {
        RoleResponse response = roleService.deleteRole(roleId);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", response));
    }
}
