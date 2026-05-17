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
import com.emenu.shared.constants.AuthConstants;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.utils.TokenUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final SecurityUtils securityUtils;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse userResponse = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", userResponse));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @Valid @RequestBody UserUpdateRequest updateRequestData) {
        UserResponse updatedUserResponse = userService.updateCurrentUser(updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updatedUserResponse));
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
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

}
