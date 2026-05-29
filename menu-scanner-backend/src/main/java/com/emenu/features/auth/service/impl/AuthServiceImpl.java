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
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.service.AuthService;
import com.emenu.features.auth.service.RefreshTokenService;
import com.emenu.features.auth.service.UserSessionService;
import com.emenu.features.auth.service.UserValidationService;
import com.emenu.security.ClientContextUtils;
import com.emenu.security.SecurityUtils;
import com.emenu.security.jwt.JWTGenerator;
import com.emenu.security.jwt.TokenBlacklistService;
import com.emenu.shared.constants.AuthConstants;
import com.emenu.shared.constants.AuthStatusMessages;
import com.emenu.shared.utils.TokenUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final ClientContextUtils clientContextUtils;
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
            throw new ValidationException("Your password is incorrect. Please try again or reset your password if you've forgotten it.");
        }

        securityUtils.validateAccountStatus(userEntity);

        String subscriptionWarning = null;
        if (userEntity.isBusinessUser() && userEntity.getBusinessId() != null) {
            subscriptionWarning = validateBusinessSubscriptionAndStatus(userEntity);
        } else if (userEntity.isPlatformUser() || userEntity.isCustomer()) {
            // PLATFORM_USER and CUSTOMER only need account status validation (already done above)
            log.debug("User type {} requires only account status validation", userEntity.getUserType());
        }

        List<String> roleNames = userEntity.getRoles().stream()
                .map(Role::getName)
                .toList();

        String accessTokenString = jwtGenerator.generateAccessTokenFromUsername(
                userEntity.getUserIdentifier(),
                roleNames,
                userEntity.getUserType().name(),
                userEntity.getId().toString(),
                userEntity.getUserIdentifier()
        );

        String clientIpAddress = clientContextUtils.getClientIpAddress();
        String clientDeviceInfo = clientContextUtils.getDeviceInfo();
        RefreshToken refreshTokenEntity = refreshTokenService.createRefreshToken(userEntity, clientIpAddress, clientDeviceInfo);

        HttpServletRequest httpRequest = clientContextUtils.getHttpServletRequest();
        if (httpRequest != null) {
            userSessionService.createSession(userEntity, refreshTokenEntity, httpRequest);
        }

        LoginResponse loginResponse = userMapper.toLoginResponse(userEntity, accessTokenString);
        loginResponse.setRefreshToken(refreshTokenEntity.getToken());
        if (subscriptionWarning != null) {
            loginResponse.setSubscriptionWarningMessage(subscriptionWarning);
        }

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
                    log.warn("User login failed - business not found: business_id={}", userEntity.getBusinessId());
                    return new ValidationException("Business not found");
                });

        if (!businessEntity.isActive()) {
            log.warn("User login failed - business inactive: business_id={}, status={}", userEntity.getBusinessId(), businessEntity.getStatus());
            throw new ValidationException("Your business account is currently " + businessEntity.getStatus() + ". Please contact support.");
        }

        if (!businessEntity.hasActiveSubscription()) {
            log.warn("User login failed - no active subscription: business_id={}", userEntity.getBusinessId());
            throw new ValidationException("Your business subscription has expired. Please renew your subscription to continue.");
        }
    }

    private String validateBusinessSubscriptionAndStatus(User userEntity) {
        Business businessEntity = businessRepository.findById(userEntity.getBusinessId())
                .orElseThrow(() -> {
                    log.warn("User login failed - business not found: business_id={}", userEntity.getBusinessId());
                    return new ValidationException(AuthStatusMessages.BUSINESS_NOT_FOUND);
                });

        // Check business status first
        if (!businessEntity.isActive()) {
            log.warn("User login failed - business not active: business_id={}, status={}",
                    userEntity.getBusinessId(), businessEntity.getStatus());
            if (businessEntity.getStatus().name().equals("SUSPENDED")) {
                throw new ValidationException(AuthStatusMessages.BUSINESS_SUSPENDED);
            } else {
                throw new ValidationException(AuthStatusMessages.BUSINESS_INACTIVE);
            }
        }

        // Check subscription status
        if (businessEntity.hasActiveSubscription()) {
            // Subscription is active, proceed
            log.debug("Business subscription is active: business_id={}", userEntity.getBusinessId());
            return null;
        }

        // Subscription not active, check if in grace period
        if (businessEntity.isInSubscriptionGracePeriod()) {
            long daysRemaining = businessEntity.getDaysRemainingInGracePeriod();
            Subscription subscription = businessEntity.getMostRecentSubscription();

            if (subscription != null && daysRemaining > 0) {
                log.warn("User login during subscription grace period: business_id={}, days_remaining={}",
                        userEntity.getBusinessId(), daysRemaining);
                // Allow login but return warning message
                return AuthStatusMessages.formatGracePeriodMessage(
                        subscription.getEndDate(),
                        daysRemaining
                );
            }
        } else {
            // Grace period expired, block login
            log.warn("User login failed - subscription grace period expired: business_id={}",
                    userEntity.getBusinessId());
            throw new ValidationException(AuthStatusMessages.SUBSCRIPTION_GRACE_PERIOD_EXPIRED);
        }

        return null;
    }

    private User findUserWithContext(LoginRequest loginRequestData) {
        String userIdentifier = loginRequestData.getUserIdentifier();
        UserType userTypeEnum = loginRequestData.getUserType();
        UUID businessIdValue = loginRequestData.getBusinessId();

        if (userTypeEnum == null) {
            log.warn("User login failed - missing user type");
            throw new ValidationException(
                    "User type is required. Please specify whether you are logging in as CUSTOMER, PLATFORM_USER, or BUSINESS_USER."
            );
        }

        if (userTypeEnum == UserType.BUSINESS_USER) {
            if (businessIdValue == null) {
                log.warn("User login failed - missing business ID: identifier={}", userIdentifier);
                throw new ValidationException(
                        "Business ID is required for business user login. Please provide businessId in your login request."
                );
            }

            return userRepository.findByUserIdentifierAndBusinessIdAndIsDeletedFalse(userIdentifier, businessIdValue)
                    .orElseThrow(() -> {
                        log.warn("User login failed - user not found in business: identifier={}, business_id={}", userIdentifier, businessIdValue);
                        return new ValidationException(
                                "Business user account not found. Please check your email or username and ensure you're using the correct business account."
                        );
                    });
        }

        return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userTypeEnum)
                .orElseThrow(() -> {
                    log.warn("User login failed - user not found: identifier={}, type={}", userIdentifier, userTypeEnum);
                    String userTypeLabel = userTypeEnum.name().toLowerCase().replace("_", " ");
                    return new ValidationException(
                            "Account not found as " + userTypeLabel + ". Please check your email or username and ensure you're logging in with the correct account type."
                    );
                });
    }

    private void validateLoginContext(LoginRequest loginRequestData, User userEntity) {
        if (!loginRequestData.getUserType().equals(userEntity.getUserType())) {
            log.warn("User login failed - user type mismatch: expected={}, found={}", loginRequestData.getUserType(), userEntity.getUserType());
            throw new ValidationException(
                    "User type mismatch. Expected: " + loginRequestData.getUserType() +
                            ", Found: " + userEntity.getUserType()
            );
        }

        if (loginRequestData.getUserType() == UserType.BUSINESS_USER) {
            if (userEntity.getBusinessId() == null) {
                log.warn("User login failed - user not associated with business: user_id={}", userEntity.getId());
                throw new ValidationException("User is not associated with any business");
            }
            if (!loginRequestData.getBusinessId().equals(userEntity.getBusinessId())) {
                log.warn("User login failed - business mismatch: user_id={}, expected_business={}, user_business={}",
                        userEntity.getId(), loginRequestData.getBusinessId(), userEntity.getBusinessId());
                throw new ValidationException("User does not belong to the specified business");
            }
        }
    }

    @Override
    public UserResponse registerCustomer(RegisterRequest registrationRequestData) {
        log.info("Customer registration initiated: identifier={}", registrationRequestData.getUserIdentifier());

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
                    log.warn("Customer registration failed - customer role not found");
                    return new ValidationException("Customer role not found");
                });

        if (!customerRoleEntity.isCompatibleWithUserType(UserType.CUSTOMER)) {
            log.warn("Customer registration failed - customer role not compatible with user type");
            throw new ValidationException("CUSTOMER role is not properly configured for CUSTOMER user type");
        }

        userEntity.setRoles(List.of(customerRoleEntity));

        User savedUserEntity = userRepository.save(userEntity);

        log.info("Customer registration completed successfully: identifier={}, user_id={}", savedUserEntity.getUserIdentifier(), savedUserEntity.getId());
        return userMapper.toResponse(savedUserEntity);
    }

    @Override
    public void logout(String authorizationHeader) {
        String accessTokenString = TokenUtils.extractTokenFromAuthHeader(authorizationHeader);

        if (accessTokenString == null || !jwtGenerator.validateToken(accessTokenString)) {
            log.warn("User logout failed - invalid token");
            throw new ValidationException("Invalid token");
        }

        String userIdentifier = jwtGenerator.getUsernameFromJWT(accessTokenString);
        String userTypeString = jwtGenerator.getUserTypeFromJWT(accessTokenString);
        String businessIdString = jwtGenerator.getBusinessIdFromJWT(accessTokenString);

        tokenBlacklistService.blacklistToken(accessTokenString, userIdentifier, AuthConstants.SESSION_REASON_LOGOUT);
        User userEntity = findUserByRefreshTokenContext(userIdentifier, userTypeString, businessIdString);
        refreshTokenService.revokeAllUserTokens(userEntity.getId(), AuthConstants.SESSION_REASON_LOGOUT);

        log.info("User logged out successfully: identifier={}, type={}, user_id={}", userIdentifier, userTypeString, userEntity.getId());
    }

    @Override
    public UserResponse changePassword(PasswordChangeRequest passwordChangeRequestData) {
        User currentUserEntity = securityUtils.getCurrentUser();

        if (!passwordEncoder.matches(passwordChangeRequestData.getCurrentPassword(), currentUserEntity.getPassword())) {
            log.warn("Password change failed - incorrect current password: user_id={}", currentUserEntity.getId());
            throw new ValidationException("Current password is incorrect");
        }

        if (!passwordChangeRequestData.getNewPassword().equals(passwordChangeRequestData.getConfirmPassword())) {
            log.warn("Password change failed - password confirmation mismatch: user_id={}", currentUserEntity.getId());
            throw new ValidationException("Password confirmation does not match");
        }

        currentUserEntity.setPassword(passwordEncoder.encode(passwordChangeRequestData.getNewPassword()));
        User savedUserEntity = userRepository.save(currentUserEntity);

        tokenBlacklistService.blacklistAllUserTokens(currentUserEntity.getUserIdentifier(), AuthConstants.SESSION_REASON_PASSWORD_CHANGE);
        refreshTokenService.revokeAllUserTokens(currentUserEntity.getId(), AuthConstants.SESSION_REASON_PASSWORD_CHANGE);

        log.info("Password changed successfully: user_id={}, identifier={}", currentUserEntity.getId(), currentUserEntity.getUserIdentifier());

        return userMapper.toResponse(savedUserEntity);
    }

    @Override
    public UserResponse adminResetPassword(AdminPasswordResetRequest adminResetRequestData) {
        User userEntity = userRepository.findByIdAndIsDeletedFalse(adminResetRequestData.getUserId())
                .orElseThrow(() -> {
                    log.warn("Admin password reset failed - user not found: user_id={}", adminResetRequestData.getUserId());
                    return new ValidationException("User not found");
                });

        if (!adminResetRequestData.getNewPassword().equals(adminResetRequestData.getConfirmPassword())) {
            log.warn("Admin password reset failed - password confirmation mismatch: user_id={}", adminResetRequestData.getUserId());
            throw new ValidationException("Password confirmation does not match");
        }

        userEntity.setPassword(passwordEncoder.encode(adminResetRequestData.getNewPassword()));
        User savedUserEntity = userRepository.save(userEntity);

        tokenBlacklistService.blacklistAllUserTokens(userEntity.getUserIdentifier(), AuthConstants.SESSION_REASON_ADMIN_PASSWORD_RESET);
        refreshTokenService.revokeAllUserTokens(userEntity.getId(), AuthConstants.SESSION_REASON_ADMIN_PASSWORD_RESET);

        log.info("Admin password reset successfully: user_id={}, identifier={}", userEntity.getId(), userEntity.getUserIdentifier());

        return userMapper.toResponse(savedUserEntity);
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
                    log.warn("Token refresh failed - invalid or expired refresh token: identifier={}", userIdentifier);
                    return new ValidationException("Invalid or expired refresh token");
                });

        User userEntity = findUserByRefreshTokenContext(userIdentifier, userTypeString, businessIdString);

        if (!userEntity.getId().equals(refreshTokenEntity.getUserId())) {
            log.error("Token refresh failed - security violation: user ID mismatch");
            throw new ValidationException("Invalid refresh token");
        }

        securityUtils.validateAccountStatus(userEntity);

        String subscriptionWarning = null;
        if (userEntity.isBusinessUser() && userEntity.getBusinessId() != null) {
            subscriptionWarning = validateBusinessSubscriptionAndStatus(userEntity);
        } else if (userEntity.isPlatformUser() || userEntity.isCustomer()) {
            // PLATFORM_USER and CUSTOMER only need account status validation (already done above)
            log.debug("User type {} requires only account status validation", userEntity.getUserType());
        }

        List<String> roleNames = userEntity.getRoles().stream()
                .map(Role::getName)
                .toList();

        String newAccessTokenString = jwtGenerator.generateAccessTokenFromUsername(
                userEntity.getUserIdentifier(),
                roleNames,
                userEntity.getUserType().name(),
                userEntity.getId().toString(),
                userEntity.getUserIdentifier()
        );

        String clientIpAddress = clientContextUtils.getClientIpAddress();
        String clientDeviceInfo = clientContextUtils.getDeviceInfo();
        RefreshToken newRefreshTokenEntity = refreshTokenService.createRefreshToken(userEntity, clientIpAddress, clientDeviceInfo);

        HttpServletRequest httpRequest = clientContextUtils.getHttpServletRequest();
        if (httpRequest != null) {
            userSessionService.createSession(userEntity, newRefreshTokenEntity, httpRequest);
        }

        refreshTokenService.revokeRefreshToken(refreshTokenString, AuthConstants.SESSION_REASON_TOKEN_REFRESH);

        log.info("Token refresh completed successfully: identifier={}, user_id={}", userEntity.getUserIdentifier(), userEntity.getId());

        RefreshTokenResponse response = refreshTokenResponseMapper.toResponse(newAccessTokenString, newRefreshTokenEntity.getToken());
        if (subscriptionWarning != null) {
            response.setSubscriptionWarningMessage(subscriptionWarning);
        }
        return response;
    }

    private User findUserByRefreshTokenContext(String userIdentifier, String userTypeString, String businessIdString) {
        if (userTypeString == null) {
            log.warn("Refresh token validation failed - missing user type: identifier={}", userIdentifier);
            throw new ValidationException("Invalid refresh token: missing user type");
        }

        UserType userTypeEnum;
        try {
            userTypeEnum = UserType.valueOf(userTypeString);
        } catch (IllegalArgumentException e) {
            log.warn("Refresh token validation failed - invalid user type: type_string={}", userTypeString);
            throw new ValidationException("Invalid refresh token: invalid user type");
        }

        if (userTypeEnum == UserType.BUSINESS_USER) {
            if (businessIdString == null) {
                log.warn("Refresh token validation failed - missing business ID: identifier={}", userIdentifier);
                throw new ValidationException("Invalid refresh token: missing business ID for business user");
            }

            UUID businessIdValue;
            try {
                businessIdValue = UUID.fromString(businessIdString);
            } catch (IllegalArgumentException e) {
                log.warn("Refresh token validation failed - invalid business ID format: business_id_string={}", businessIdString);
                throw new ValidationException("Invalid refresh token: invalid business ID format");
            }

            return userRepository.findByUserIdentifierAndBusinessIdAndIsDeletedFalse(userIdentifier, businessIdValue)
                    .orElseThrow(() -> {
                        log.warn("Refresh token validation failed - user not found: identifier={}, business_id={}", userIdentifier, businessIdValue);
                        return new ValidationException("User not found for refresh token context");
                    });
        }

        return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userTypeEnum)
                .orElseThrow(() -> {
                    log.warn("Refresh token validation failed - user not found: identifier={}, type={}", userIdentifier, userTypeEnum);
                    return new ValidationException("User not found for refresh token context");
                });
    }
}