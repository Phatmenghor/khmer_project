package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.UserFilterRequest;
import com.emenu.features.auth.dto.request.AdminPasswordResetRequest;
import com.emenu.features.auth.dto.request.PasswordChangeRequest;
import com.emenu.features.auth.dto.request.UserCreateRequest;
import com.emenu.features.auth.dto.response.UserDetailResponse;
import com.emenu.features.auth.dto.response.UserResponse;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.features.auth.service.AuthService;
import com.emenu.features.auth.service.UserService;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final SecurityUtils securityUtils;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getCurrentUser() {
        UserDetailResponse userDetailResponse = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", userDetailResponse));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDetailResponse>> updateCurrentUser(
            @Valid @RequestBody UserUpdateRequest updateRequestData) {
        UserDetailResponse updatedUserResponse = userService.updateCurrentUserDetail(updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updatedUserResponse));
    }

    @GetMapping("/customer-profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCustomerTypeProfile() {
        UserResponse response = userService.getCustomerTypeProfile();
        return ResponseEntity.ok(ApiResponse.success("Customer profile retrieved", response));
    }

    @PutMapping("/customer-profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateCustomerTypeProfile(
            @Valid @RequestBody UserUpdateRequest updateRequestData) {
        UserResponse response = userService.updateCustomerTypeProfile(updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Customer profile updated", response));
    }

    @GetMapping("/platform-profile")
    public ResponseEntity<ApiResponse<UserResponse>> getPlatformUserProfile() {
        UserResponse response = userService.getPlatformUserProfile();
        return ResponseEntity.ok(ApiResponse.success("Platform user profile retrieved", response));
    }

    @PutMapping("/platform-profile")
    public ResponseEntity<ApiResponse<UserResponse>> updatePlatformUserProfile(
            @Valid @RequestBody UserUpdateRequest updateRequestData) {
        UserResponse response = userService.updatePlatformUserProfile(updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Platform user profile updated", response));
    }

    @GetMapping("/business-profile")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getBusinessUserProfile() {
        UserDetailResponse response = userService.getBusinessUserProfile();
        return ResponseEntity.ok(ApiResponse.success("Business user profile retrieved", response));
    }

    @PutMapping("/business-profile")
    public ResponseEntity<ApiResponse<UserDetailResponse>> updateBusinessUserProfile(
            @Valid @RequestBody UserUpdateRequest updateRequestData) {
        UserDetailResponse response = userService.updateBusinessUserProfile(updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Business user profile updated", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<UserResponse>>> getAllUsers(
            @Valid @RequestBody UserFilterRequest filterRequestData) {
        PaginationResponse<UserResponse> userListResponse = userService.getAllUsers(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", userListResponse));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<UserResponse>>> getMyBusinessUsers(
            @Valid @RequestBody UserFilterRequest filterRequestData) {
        UUID businessIdContext = securityUtils.getCurrentUserBusinessId();
        filterRequestData.setBusinessId(businessIdContext);
        PaginationResponse<UserResponse> businessUsersResponse = userService.getAllUsers(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", businessUsersResponse));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserById(@PathVariable UUID userId) {
        UserDetailResponse userDetailResponse = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", userDetailResponse));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest createRequestData) {
        UserResponse createdUserResponse = userService.createUser(createRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created", createdUserResponse));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<UserResponse>>> createUserBatch(
            @RequestBody List<UserCreateRequest> requests,
            @RequestParam(required = false) String importId) {
        BatchImportResponse<UserResponse> response = userService.createUserBatch(requests, importId);
        return ResponseEntity.ok(ApiResponse.success("Batch user import completed", response));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UserUpdateRequest updateRequestData) {
        UserResponse updatedResponse = userService.updateUser(userId, updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("User updated", updatedResponse));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> deleteUser(@PathVariable UUID userId) {
        UserResponse deletedUserResponse = userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted", deletedUserResponse));
    }

    @PostMapping("/admin/reset-password")
    public ResponseEntity<ApiResponse<UserResponse>> adminResetPassword(
            @Valid @RequestBody AdminPasswordResetRequest resetRequestData) {
        UserResponse resetUserResponse = authService.adminResetPassword(resetRequestData);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", resetUserResponse));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<UserResponse>> changePassword(
            @Valid @RequestBody PasswordChangeRequest changeRequestData) {
        UserResponse changedPasswordResponse = authService.changePassword(changeRequestData);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", changedPasswordResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Boolean>> logout(@RequestHeader("Authorization") String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", true));
    }
}
