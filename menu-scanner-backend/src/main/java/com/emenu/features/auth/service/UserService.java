package com.emenu.features.auth.service;

import com.emenu.features.auth.dto.filter.UserFilterRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerCreateRequest;
import com.emenu.features.auth.dto.request.UserCreateRequest;
import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.CustomerUserResponse;
import com.emenu.features.auth.dto.response.UserDetailResponse;
import com.emenu.features.auth.dto.response.UserResponse;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.UUID;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    PaginationResponse<UserResponse> getAllUsers(UserFilterRequest request);

    UserDetailResponse getUserById(UUID userId);
    
    UserResponse updateUser(UUID userId, UserUpdateRequest request);
    
    UserResponse deleteUser(UUID userId);
    
    UserDetailResponse getCurrentUser();

    UserDetailResponse updateCurrentUserDetail(UserUpdateRequest request);

    CustomerUserResponse getCustomerProfile();

    UserResponse updateCurrentUser(UserUpdateRequest request);

    CustomerUserResponse updateCustomerProfile(UserUpdateRequest request);

    UserResponse getCustomerTypeProfile();

    UserResponse updateCustomerTypeProfile(UserUpdateRequest request);

    UserResponse getPlatformUserProfile();

    UserResponse updatePlatformUserProfile(UserUpdateRequest request);
}