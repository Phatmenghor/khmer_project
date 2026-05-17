package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.request.AdminPasswordResetRequest;
import com.emenu.features.auth.dto.request.LoginRequest;
import com.emenu.features.auth.dto.request.PasswordChangeRequest;
import com.emenu.features.auth.dto.request.RefreshTokenRequest;
import com.emenu.features.auth.dto.request.RegisterRequest;
import com.emenu.features.auth.dto.response.LoginResponse;
import com.emenu.features.auth.dto.response.RefreshTokenResponse;
import com.emenu.features.auth.dto.response.UserResponse;
import com.emenu.features.auth.mapper.RefreshTokenResponseMapper;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.RefreshToken;
import com.emenu.features.auth.models.Role;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.service.AuthService;
import com.emenu.features.auth.service.RefreshTokenService;
import com.emenu.features.auth.service.UserSessionService;
import com.emenu.features.auth.service.UserValidationService;
import com.emenu.security.SecurityUtils;
import com.emenu.security.jwt.JWTGenerator;
import com.emenu.security.jwt.TokenBlacklistService;
import com.emenu.shared.constants.AuthConstants;
import com.emenu.shared.utils.TokenUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BusinessRepository businessRepository;
    private final UserMapper userMapper;
    private final RefreshTokenResponseMapper refreshTokenResponseMapper;
    private final PasswordEncoder passwordEncoder;
    private final JWTGenerator jwtGenerator;
    private final SecurityUtils securityUtils;
    private final TokenBlacklistService tokenBlacklistService;
    private final RefreshTokenService refreshTokenService;
    private final UserSessionService userSessionService;
    private final UserValidationService userValidationService;

    @Override
    public LoginResponse login(LoginRequest loginRequestData) {
        log.info("User login initiated: identifier={}, type={}", loginRequestData.getUserIdentifier(), loginRequestData.getUserType());

        User userEntity = findUserWithContext(loginRequestData);
        validateLoginContext(loginRequestData, userEntity);

        if (!passwordEncoder.matches(loginRequestData.getPassword(), userEntity.getPassword())) {
            log.warn("User login failed - invalid password: identifier={}", loginRequestData.getUserIdentifier());
            throw new ValidationException("Invalid credentials");
        }

        securityUtils.validateAccountStatus(userEntity);

        if (userEntity.isBusinessUser() && userEntity.getBusinessId() != null) {
            validateBusinessLoginContext(userEntity);
        }

        List<String> roleNames = userEntity.getRoles().stream()
                .map(Role::getName)
                .toList();

        String accessTokenString = jwtGenerator.generateAccessTokenFromUsername(
                userEntity.getUserIdentifier(),
                roleNames,
                userEntity.getUserType().name()
        );

        String clientIpAddress = getClientIpAddress();
        String clientDeviceInfo = getDeviceInfo();
        RefreshToken refreshTokenEntity = refreshTokenService.createRefreshToken(userEntity, clientIpAddress, clientDeviceInfo);

        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            userSessionService.createSession(userEntity, refreshTokenEntity, httpRequest);
        }

        LoginResponse loginResponse = userMapper.toLoginResponse(userEntity, accessTokenString);
        loginResponse.setRefreshToken(refreshTokenEntity.getToken());

        if (userEntity.isBusinessUser() && userEntity.getBusinessId() != null) {
            Business businessEntity = businessRepository.findById(userEntity.getBusinessId()).orElse(null);
            if (businessEntity != null) {
                loginResponse.setBusinessStatus(businessEntity.getStatus().toString());
                loginResponse.setIsSubscriptionActive(businessEntity.hasActiveSubscription());
            }
        }

        log.info("User logged in successfully: identifier={}, type={}, user_id={}", userEntity.getUserIdentifier(), userEntity.getUserType(), userEntity.getId());
        return loginResponse;
    }

    private void validateBusinessLoginContext(User userEntity) {
        Business businessEntity = businessRepository.findById(userEntity.getBusinessId())
                .orElseThrow(() -> {
                    log.warn("LOGIN_FAILED_BUSINESS_NOT_FOUND: business_id={}", userEntity.getBusinessId());
                    return new ValidationException("Business not found");
                });

        if (!businessEntity.isActive()) {
            log.warn("LOGIN_FAILED_BUSINESS_INACTIVE: business_id={}, status={}", userEntity.getBusinessId(), businessEntity.getStatus());
            throw new ValidationException("Your business account is currently " + businessEntity.getStatus() + ". Please contact support.");
        }

        if (!businessEntity.hasActiveSubscription()) {
            log.warn("LOGIN_FAILED_NO_ACTIVE_SUBSCRIPTION: business_id={}", userEntity.getBusinessId());
            throw new ValidationException("Your business subscription has expired. Please renew your subscription to continue.");
        }
    }

    private User findUserWithContext(LoginRequest loginRequestData) {
        String userIdentifier = loginRequestData.getUserIdentifier();
        UserType userTypeEnum = loginRequestData.getUserType();
        UUID businessIdValue = loginRequestData.getBusinessId();

        if (userTypeEnum == null) {
            log.warn("LOGIN_FAILED_MISSING_USER_TYPE");
            throw new ValidationException(
                    "User type is required. Please specify whether you are logging in as CUSTOMER, PLATFORM_USER, or BUSINESS_USER."
            );
        }

        if (userTypeEnum == UserType.BUSINESS_USER) {
            if (businessIdValue == null) {
                log.warn("LOGIN_FAILED_MISSING_BUSINESS_ID: identifier={}", userIdentifier);
                throw new ValidationException(
                        "Business ID is required for business user login. Please provide businessId in your login request."
                );
            }

            return userRepository.findByUserIdentifierAndBusinessIdAndIsDeletedFalse(userIdentifier, businessIdValue)
                    .orElseThrow(() -> {
                        log.warn("LOGIN_FAILED_USER_NOT_FOUND_IN_BUSINESS: identifier={}, business_id={}", userIdentifier, businessIdValue);
                        return new ValidationException(
                                "User '" + userIdentifier + "' not found in the specified business"
                        );
                    });
        }

        return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userTypeEnum)
                .orElseThrow(() -> {
                    log.warn("LOGIN_FAILED_USER_NOT_FOUND: identifier={}, type={}", userIdentifier, userTypeEnum);
                    return new ValidationException(
                            "User '" + userIdentifier + "' not found as " + userTypeEnum.name().toLowerCase().replace("_", " ")
                    );
                });
    }

    private void validateLoginContext(LoginRequest loginRequestData, User userEntity) {
        if (!loginRequestData.getUserType().equals(userEntity.getUserType())) {
            log.warn("LOGIN_FAILED_USER_TYPE_MISMATCH: expected={}, found={}", loginRequestData.getUserType(), userEntity.getUserType());
            throw new ValidationException(
                    "User type mismatch. Expected: " + loginRequestData.getUserType() +
                            ", Found: " + userEntity.getUserType()
            );
        }

        if (loginRequestData.getUserType() == UserType.BUSINESS_USER) {
            if (userEntity.getBusinessId() == null) {
                log.warn("LOGIN_FAILED_USER_NO_BUSINESS: user_id={}", userEntity.getId());
                throw new ValidationException("User is not associated with any business");
            }
            if (!loginRequestData.getBusinessId().equals(userEntity.getBusinessId())) {
                log.warn("LOGIN_FAILED_BUSINESS_MISMATCH: user_id={}, expected_business={}, user_business={}",
                        userEntity.getId(), loginRequestData.getBusinessId(), userEntity.getBusinessId());
                throw new ValidationException("User does not belong to the specified business");
            }
        }
    }

    @Override
    public UserResponse registerCustomer(RegisterRequest registrationRequestData) {
        log.info("CUSTOMER_REGISTRATION_INITIATED: identifier={}", registrationRequestData.getUserIdentifier());

        userValidationService.validateUsernameUniqueness(
                registrationRequestData.getUserIdentifier(),
                UserType.CUSTOMER,
                null
        );

        User userEntity = userMapper.toEntity(registrationRequestData);
        userEntity.setUserType(UserType.CUSTOMER);
        userEntity.setPassword(passwordEncoder.encode(registrationRequestData.getPassword()));

        Role customerRoleEntity = roleRepository.findByNameAndIsDeletedFalse("CUSTOMER")
                .orElseThrow(() -> {
                    log.warn("CUSTOMER_REGISTRATION_FAILED_ROLE_NOT_FOUND");
                    return new ValidationException("Customer role not found");
                });

        if (!customerRoleEntity.isCompatibleWithUserType(UserType.CUSTOMER)) {
            log.warn("CUSTOMER_REGISTRATION_FAILED_ROLE_INCOMPATIBLE");
            throw new ValidationException("CUSTOMER role is not properly configured for CUSTOMER user type");
        }

        userEntity.setRoles(List.of(customerRoleEntity));

        User savedUserEntity = userRepository.save(userEntity);

        log.info("CUSTOMER_REGISTRATION_SUCCESS: identifier={}, user_id={}", savedUserEntity.getUserIdentifier(), savedUserEntity.getId());
        return userMapper.toResponse(savedUserEntity);
    }

    @Override
    public void logout(String authorizationHeader) {
        String accessTokenString = TokenUtils.extractTokenFromAuthHeader(authorizationHeader);

        if (accessTokenString == null || !jwtGenerator.validateToken(accessTokenString)) {
            log.warn("LOGOUT_FAILED_INVALID_TOKEN");
            throw new ValidationException("Invalid token");
        }

        String userIdentifier = jwtGenerator.getUsernameFromJWT(accessTokenString);
        String userTypeString = jwtGenerator.getUserTypeFromJWT(accessTokenString);
        String businessIdString = jwtGenerator.getBusinessIdFromJWT(accessTokenString);

        tokenBlacklistService.blacklistToken(accessTokenString, userIdentifier, AuthConstants.SESSION_REASON_LOGOUT);
        User userEntity = findUserByRefreshTokenContext(userIdentifier, userTypeString, businessIdString);
        refreshTokenService.revokeAllUserTokens(userEntity.getId(), AuthConstants.SESSION_REASON_LOGOUT);

        log.info("LOGOUT_SUCCESS: identifier={}, type={}, user_id={}", userIdentifier, userTypeString, userEntity.getId());
    }

    @Override
    public UserResponse changePassword(PasswordChangeRequest passwordChangeRequestData) {
        User currentUserEntity = securityUtils.getCurrentUser();

        if (!passwordEncoder.matches(passwordChangeRequestData.getCurrentPassword(), currentUserEntity.getPassword())) {
            log.warn("PASSWORD_CHANGE_FAILED_INCORRECT_CURRENT: user_id={}", currentUserEntity.getId());
            throw new ValidationException("Current password is incorrect");
        }

        if (!passwordChangeRequestData.getNewPassword().equals(passwordChangeRequestData.getConfirmPassword())) {
            log.warn("PASSWORD_CHANGE_FAILED_MISMATCH: user_id={}", currentUserEntity.getId());
            throw new ValidationException("Password confirmation does not match");
        }

        currentUserEntity.setPassword(passwordEncoder.encode(passwordChangeRequestData.getNewPassword()));
        User savedUserEntity = userRepository.save(currentUserEntity);

        tokenBlacklistService.blacklistAllUserTokens(currentUserEntity.getUserIdentifier(), AuthConstants.SESSION_REASON_PASSWORD_CHANGE);
        refreshTokenService.revokeAllUserTokens(currentUserEntity.getId(), AuthConstants.SESSION_REASON_PASSWORD_CHANGE);

        log.info("PASSWORD_CHANGE_SUCCESS: user_id={}, identifier={}", currentUserEntity.getId(), currentUserEntity.getUserIdentifier());

        return userMapper.toResponse(savedUserEntity);
    }

    @Override
    public UserResponse adminResetPassword(AdminPasswordResetRequest adminResetRequestData) {
        User userEntity = userRepository.findByIdAndIsDeletedFalse(adminResetRequestData.getUserId())
                .orElseThrow(() -> {
                    log.warn("ADMIN_PASSWORD_RESET_FAILED_USER_NOT_FOUND: user_id={}", adminResetRequestData.getUserId());
                    return new ValidationException("User not found");
                });

        if (!adminResetRequestData.getNewPassword().equals(adminResetRequestData.getConfirmPassword())) {
            log.warn("ADMIN_PASSWORD_RESET_FAILED_MISMATCH: user_id={}", adminResetRequestData.getUserId());
            throw new ValidationException("Password confirmation does not match");
        }

        userEntity.setPassword(passwordEncoder.encode(adminResetRequestData.getNewPassword()));
        User savedUserEntity = userRepository.save(userEntity);

        tokenBlacklistService.blacklistAllUserTokens(userEntity.getUserIdentifier(), AuthConstants.SESSION_REASON_ADMIN_PASSWORD_RESET);
        refreshTokenService.revokeAllUserTokens(userEntity.getId(), AuthConstants.SESSION_REASON_ADMIN_PASSWORD_RESET);

        log.info("ADMIN_PASSWORD_RESET_SUCCESS: user_id={}, identifier={}", userEntity.getId(), userEntity.getUserIdentifier());

        return userMapper.toResponse(savedUserEntity);
    }

    private HttpServletRequest getHttpServletRequest() {
        try {
            ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (requestAttributes != null) {
                return requestAttributes.getRequest();
            }
        } catch (Exception e) {
            log.warn("FAILED_TO_GET_HTTP_REQUEST: error={}", e.getMessage());
        }
        return null;
    }

    private String getClientIpAddress() {
        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            String xForwardedForHeader = httpRequest.getHeader("X-Forwarded-For");
            if (xForwardedForHeader != null && !xForwardedForHeader.isEmpty()) {
                return xForwardedForHeader.split(",")[0].trim();
            }
            return httpRequest.getRemoteAddr();
        }
        return AuthConstants.UNKNOWN_IP;
    }

    private String getDeviceInfo() {
        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            return httpRequest.getHeader("User-Agent");
        }
        return AuthConstants.UNKNOWN_DEVICE;
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest refreshTokenRequestData) {
        String refreshTokenString = refreshTokenRequestData.getRefreshToken();

        if (!jwtGenerator.validateToken(refreshTokenString)) {
            log.warn("TOKEN_REFRESH_FAILED_INVALID_TOKEN");
            throw new ValidationException("Invalid refresh token");
        }

        String userIdentifier = jwtGenerator.getUsernameFromJWT(refreshTokenString);
        String userTypeString = jwtGenerator.getUserTypeFromJWT(refreshTokenString);
        String businessIdString = jwtGenerator.getBusinessIdFromJWT(refreshTokenString);

        RefreshToken refreshTokenEntity = refreshTokenService.verifyRefreshToken(refreshTokenString)
                .orElseThrow(() -> {
                    log.warn("TOKEN_REFRESH_FAILED_INVALID_OR_EXPIRED: identifier={}", userIdentifier);
                    return new ValidationException("Invalid or expired refresh token");
                });

        User userEntity = findUserByRefreshTokenContext(userIdentifier, userTypeString, businessIdString);

        if (!userEntity.getId().equals(refreshTokenEntity.getUserId())) {
            log.error("TOKEN_REFRESH_FAILED_SECURITY_VIOLATION: user_id_mismatch");
            throw new ValidationException("Invalid refresh token");
        }

        securityUtils.validateAccountStatus(userEntity);

        if (userEntity.isBusinessUser() && userEntity.getBusinessId() != null) {
            validateBusinessLoginContext(userEntity);
        }

        List<String> roleNames = userEntity.getRoles().stream()
                .map(Role::getName)
                .toList();

        String newAccessTokenString = jwtGenerator.generateAccessTokenFromUsername(
                userEntity.getUserIdentifier(),
                roleNames,
                userEntity.getUserType().name()
        );

        String clientIpAddress = getClientIpAddress();
        String clientDeviceInfo = getDeviceInfo();
        RefreshToken newRefreshTokenEntity = refreshTokenService.createRefreshToken(userEntity, clientIpAddress, clientDeviceInfo);

        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            userSessionService.createSession(userEntity, newRefreshTokenEntity, httpRequest);
        }

        refreshTokenService.revokeRefreshToken(refreshTokenString, AuthConstants.SESSION_REASON_TOKEN_REFRESH);

        log.info("TOKEN_REFRESH_SUCCESS: identifier={}, user_id={}", userEntity.getUserIdentifier(), userEntity.getId());

        return refreshTokenResponseMapper.toResponse(newAccessTokenString, newRefreshTokenEntity.getToken());
    }

    private User findUserByRefreshTokenContext(String userIdentifier, String userTypeString, String businessIdString) {
        if (userTypeString == null) {
            log.warn("REFRESH_TOKEN_CONTEXT_FAILED_MISSING_USER_TYPE: identifier={}", userIdentifier);
            throw new ValidationException("Invalid refresh token: missing user type");
        }

        UserType userTypeEnum;
        try {
            userTypeEnum = UserType.valueOf(userTypeString);
        } catch (IllegalArgumentException e) {
            log.warn("REFRESH_TOKEN_CONTEXT_FAILED_INVALID_USER_TYPE: type_string={}", userTypeString);
            throw new ValidationException("Invalid refresh token: invalid user type");
        }

        if (userTypeEnum == UserType.BUSINESS_USER) {
            if (businessIdString == null) {
                log.warn("REFRESH_TOKEN_CONTEXT_FAILED_MISSING_BUSINESS_ID: identifier={}", userIdentifier);
                throw new ValidationException("Invalid refresh token: missing business ID for business user");
            }

            UUID businessIdValue;
            try {
                businessIdValue = UUID.fromString(businessIdString);
            } catch (IllegalArgumentException e) {
                log.warn("REFRESH_TOKEN_CONTEXT_FAILED_INVALID_BUSINESS_ID: business_id_string={}", businessIdString);
                throw new ValidationException("Invalid refresh token: invalid business ID format");
            }

            return userRepository.findByUserIdentifierAndBusinessIdAndIsDeletedFalse(userIdentifier, businessIdValue)
                    .orElseThrow(() -> {
                        log.warn("REFRESH_TOKEN_CONTEXT_FAILED_USER_NOT_FOUND: identifier={}, business_id={}", userIdentifier, businessIdValue);
                        return new ValidationException("User not found for refresh token context");
                    });
        }

        return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userTypeEnum)
                .orElseThrow(() -> {
                    log.warn("REFRESH_TOKEN_CONTEXT_FAILED_USER_NOT_FOUND: identifier={}, type={}", userIdentifier, userTypeEnum);
                    return new ValidationException("User not found for refresh token context");
                });
    }
}