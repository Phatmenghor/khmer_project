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

import com.emenu.shared.dto.BatchImportResponse;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(
            @Valid @RequestBody RoleCreateRequest createRequestData) {
        RoleResponse createdRoleResponse = roleService.createRole(createRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role created successfully", createdRoleResponse));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<RoleResponse>>> createRoleBatch(
            @RequestBody List<RoleCreateRequest> requests,
            @RequestParam(required = false) String importId) {
        BatchImportResponse<RoleResponse> response = roleService.createRoleBatch(requests, importId);
        return ResponseEntity.ok(ApiResponse.success("Batch role import completed", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<RoleResponse>>> getAllRoles(
            @Valid @RequestBody RoleFilterRequest filterRequestData) {
        PaginationResponse<RoleResponse> rolesResponse = roleService.getAllRoles(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", rolesResponse));
    }

    @PostMapping("/all-list")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRolesList(
            @Valid @RequestBody RoleFilterRequest filterRequestData) {
        List<RoleResponse> rolesListResponse = roleService.getAllRolesList(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", rolesListResponse));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<RoleResponse>>> getMyBusinessRoles(
            @Valid @RequestBody RoleFilterRequest filterRequestData) {
        UUID businessIdContext = securityUtils.getCurrentUserBusinessId();
        filterRequestData.setBusinessId(businessIdContext);
        PaginationResponse<RoleResponse> businessRolesResponse = roleService.getAllRoles(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", businessRolesResponse));
    }

    @PostMapping("/my-business/all-list")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getMyBusinessRolesList(
            @Valid @RequestBody RoleFilterRequest filterRequestData) {
        UUID businessIdContext = securityUtils.getCurrentUserBusinessId();
        filterRequestData.setBusinessId(businessIdContext);
        List<RoleResponse> businessRolesListResponse = roleService.getAllRolesList(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", businessRolesListResponse));
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleDetailResponse>> getRoleById(
            @PathVariable UUID roleId) {
        RoleDetailResponse roleDetailResponse = roleService.getRoleById(roleId);
        return ResponseEntity.ok(ApiResponse.success("Role retrieved", roleDetailResponse));
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable UUID roleId,
            @Valid @RequestBody RoleUpdateRequest updateRequestData) {
        RoleResponse updatedRoleResponse = roleService.updateRole(roleId, updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", updatedRoleResponse));
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleResponse>> deleteRole(
            @PathVariable UUID roleId) {
        RoleResponse deletedRoleResponse = roleService.deleteRole(roleId);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", deletedRoleResponse));
    }
}
