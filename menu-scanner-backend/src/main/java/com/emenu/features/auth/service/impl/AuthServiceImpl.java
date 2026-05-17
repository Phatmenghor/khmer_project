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
    private final AuthenticationManager authenticationManager;
    private final JWTGenerator jwtGenerator;
    private final SecurityUtils securityUtils;
    private final TokenBlacklistService tokenBlacklistService;
    private final RefreshTokenService refreshTokenService;
    private final UserSessionService userSessionService;
    private final UserValidationService userValidationService;

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for user: {} (type: {})", request.getUserIdentifier(), request.getUserType());

        User user = findUserWithContext(request);
        validateLoginContext(request, user);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed - Invalid password for user: {}", request.getUserIdentifier());
            throw new ValidationException("Invalid credentials");
        }

        securityUtils.validateAccountStatus(user);

        if (user.isBusinessUser() && user.getBusinessId() != null) {
            validateBusinessLoginContext(user);
        }

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        String accessToken = jwtGenerator.generateAccessTokenFromUsername(
                user.getUserIdentifier(),
                roles,
                user.getUserType().name()
        );

        String ipAddress = getClientIpAddress();
        String deviceInfo = getDeviceInfo();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, ipAddress, deviceInfo);

        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            userSessionService.createSession(user, refreshToken, httpRequest);
        }

        LoginResponse response = userMapper.toLoginResponse(user, accessToken);
        response.setRefreshToken(refreshToken.getToken());

        if (user.isBusinessUser() && user.getBusinessId() != null) {
            Business business = businessRepository.findById(user.getBusinessId()).orElse(null);
            if (business != null) {
                response.setBusinessStatus(business.getStatus().toString());
                response.setIsSubscriptionActive(business.hasActiveSubscription());
            }
        }

        log.info("Login successful for user: {} (type: {})", user.getUserIdentifier(), user.getUserType());
        return response;
    }

    private void validateBusinessLoginContext(User user) {
        Business business = businessRepository.findById(user.getBusinessId())
                .orElseThrow(() -> new ValidationException("Business not found"));

        if (!business.isActive()) {
            log.warn("Login denied - Business inactive: {} (status: {})", user.getBusinessId(), business.getStatus());
            throw new ValidationException("Your business account is currently " + business.getStatus() + ". Please contact support.");
        }

        if (!business.hasActiveSubscription()) {
            log.warn("Login denied - No active subscription for business: {}", user.getBusinessId());
            throw new ValidationException("Your business subscription has expired. Please renew your subscription to continue.");
        }
    }

    /**
     * Find user with context-aware lookup based on userType and businessId.
     * UserType is REQUIRED to disambiguate which user account to authenticate.
     */
    private User findUserWithContext(LoginRequest request) {
        String userIdentifier = request.getUserIdentifier();
        UserType userType = request.getUserType();
        UUID businessId = request.getBusinessId();

        // Validate userType is provided (should be caught by @NotNull, but double-check)
        if (userType == null) {
            throw new ValidationException(
                    "User type is required. Please specify whether you are logging in as CUSTOMER, PLATFORM_USER, or BUSINESS_USER."
            );
        }

        // Case 1: BUSINESS_USER - requires businessId
        if (userType == UserType.BUSINESS_USER) {
            if (businessId == null) {
                throw new ValidationException(
                        "Business ID is required for business user login. Please provide businessId in your login request."
                );
            }

            log.debug("Looking up business user: {} in business: {}", userIdentifier, businessId);
            return userRepository.findByUserIdentifierAndBusinessIdAndIsDeletedFalse(userIdentifier, businessId)
                    .orElseThrow(() -> new ValidationException(
                            "User '" + userIdentifier + "' not found in the specified business"
                    ));
        }

        // Case 2: CUSTOMER or PLATFORM_USER - global uniqueness per type
        log.debug("Looking up {} user: {}", userType, userIdentifier);
        return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userType)
                .orElseThrow(() -> new ValidationException(
                        "User '" + userIdentifier + "' not found as " + userType.name().toLowerCase().replace("_", " ")
                ));
    }

    /**
     * Validate that the found user matches the requested context.
     * This is a safety check - the findUserWithContext method should already ensure correct user.
     */
    private void validateLoginContext(LoginRequest request, User user) {
        // Validate userType matches
        if (!request.getUserType().equals(user.getUserType())) {
            throw new ValidationException(
                    "User type mismatch. Expected: " + request.getUserType() +
                            ", Found: " + user.getUserType()
            );
        }

        // Validate businessId for business users
        if (request.getUserType() == UserType.BUSINESS_USER) {
            if (user.getBusinessId() == null) {
                throw new ValidationException("User is not associated with any business");
            }
            if (!request.getBusinessId().equals(user.getBusinessId())) {
                throw new ValidationException("User does not belong to the specified business");
            }
        }
    }

    /**
     * Registers a new customer user
     */
    @Override
    public UserResponse registerCustomer(RegisterRequest request) {
        log.info("Customer registration: {}", request.getUserIdentifier());

        // Validate username uniqueness for CUSTOMER type (global uniqueness among customers)
        userValidationService.validateUsernameUniqueness(
                request.getUserIdentifier(),
                UserType.CUSTOMER,
                null
        );

        User user = userMapper.toEntity(request);
        user.setUserType(UserType.CUSTOMER);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role customerRole = roleRepository.findByNameAndIsDeletedFalse("CUSTOMER")
                .orElseThrow(() -> new ValidationException("Customer role not found"));

        // Validate role is compatible with CUSTOMER user type
        if (!customerRole.isCompatibleWithUserType(UserType.CUSTOMER)) {
            throw new ValidationException("CUSTOMER role is not properly configured for CUSTOMER user type");
        }

        user.setRoles(List.of(customerRole));

        User savedUser = userRepository.save(user);

        log.info("Customer registered: {}", savedUser.getUserIdentifier());
        return userMapper.toResponse(savedUser);
    }

    @Override
    public void logout(String authorizationHeader) {
        String token = TokenUtils.extractTokenFromAuthHeader(authorizationHeader);

        if (token == null || !jwtGenerator.validateToken(token)) {
            throw new ValidationException("Invalid token");
        }

        String userIdentifier = jwtGenerator.getUsernameFromJWT(token);
        String userTypeStr = jwtGenerator.getUserTypeFromJWT(token);
        String businessIdStr = jwtGenerator.getBusinessIdFromJWT(token);

        tokenBlacklistService.blacklistToken(token, userIdentifier, AuthConstants.SESSION_REASON_LOGOUT);
        User user = findUserByRefreshTokenContext(userIdentifier, userTypeStr, businessIdStr);
        refreshTokenService.revokeAllUserTokens(user.getId(), AuthConstants.SESSION_REASON_LOGOUT);

        log.info("Logout successful for user: {} (type: {})", userIdentifier, userTypeStr);
    }

    @Override
    public UserResponse changePassword(PasswordChangeRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new ValidationException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Password confirmation does not match");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(currentUser);

        tokenBlacklistService.blacklistAllUserTokens(currentUser.getUserIdentifier(), AuthConstants.SESSION_REASON_PASSWORD_CHANGE);
        refreshTokenService.revokeAllUserTokens(currentUser.getId(), AuthConstants.SESSION_REASON_PASSWORD_CHANGE);

        log.info("Password changed for user: {}", currentUser.getUserIdentifier());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse adminResetPassword(AdminPasswordResetRequest request) {
        User user = userRepository.findByIdAndIsDeletedFalse(request.getUserId())
                .orElseThrow(() -> new ValidationException("User not found"));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Password confirmation does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(user);

        tokenBlacklistService.blacklistAllUserTokens(user.getUserIdentifier(), AuthConstants.SESSION_REASON_ADMIN_PASSWORD_RESET);
        refreshTokenService.revokeAllUserTokens(user.getId(), AuthConstants.SESSION_REASON_ADMIN_PASSWORD_RESET);

        log.info("Admin password reset for user: {}", user.getUserIdentifier());

        return userMapper.toResponse(savedUser);
    }

    private HttpServletRequest getHttpServletRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                return attributes.getRequest();
            }
        } catch (Exception e) {
            log.warn("Failed to get HttpServletRequest", e);
        }
        return null;
    }

    private String getClientIpAddress() {
        HttpServletRequest request = getHttpServletRequest();
        if (request != null) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return AuthConstants.UNKNOWN_IP;
    }

    private String getDeviceInfo() {
        HttpServletRequest request = getHttpServletRequest();
        if (request != null) {
            return request.getHeader("User-Agent");
        }
        return AuthConstants.UNKNOWN_DEVICE;
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenString = request.getRefreshToken();

        if (!jwtGenerator.validateToken(refreshTokenString)) {
            throw new ValidationException("Invalid refresh token");
        }

        String userIdentifier = jwtGenerator.getUsernameFromJWT(refreshTokenString);
        String userTypeStr = jwtGenerator.getUserTypeFromJWT(refreshTokenString);
        String businessIdStr = jwtGenerator.getBusinessIdFromJWT(refreshTokenString);

        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenString)
                .orElseThrow(() -> new ValidationException("Invalid or expired refresh token"));

        User user = findUserByRefreshTokenContext(userIdentifier, userTypeStr, businessIdStr);

        if (!user.getId().equals(refreshToken.getUserId())) {
            log.error("Security violation - User ID mismatch on refresh token");
            throw new ValidationException("Invalid refresh token");
        }

        securityUtils.validateAccountStatus(user);

        if (user.isBusinessUser() && user.getBusinessId() != null) {
            validateBusinessLoginContext(user);
        }

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        String newAccessToken = jwtGenerator.generateAccessTokenFromUsername(
                user.getUserIdentifier(),
                roles,
                user.getUserType().name()
        );

        String ipAddress = getClientIpAddress();
        String deviceInfo = getDeviceInfo();
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user, ipAddress, deviceInfo);

        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            userSessionService.createSession(user, newRefreshToken, httpRequest);
        }

        refreshTokenService.revokeRefreshToken(refreshTokenString, AuthConstants.SESSION_REASON_TOKEN_REFRESH);

        log.info("Token refreshed for user: {}", user.getUserIdentifier());

        return refreshTokenResponseMapper.toResponse(newAccessToken, newRefreshToken.getToken());
    }

    /**
     * Find user by refresh token context (userIdentifier, userType, businessId)
     */
    private User findUserByRefreshTokenContext(String userIdentifier, String userTypeStr, String businessIdStr) {
        if (userTypeStr == null) {
            throw new ValidationException("Invalid refresh token: missing user type");
        }

        UserType userType;
        try {
            userType = UserType.valueOf(userTypeStr);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid refresh token: invalid user type");
        }

        // For BUSINESS_USER, businessId is required
        if (userType == UserType.BUSINESS_USER) {
            if (businessIdStr == null) {
                throw new ValidationException("Invalid refresh token: missing business ID for business user");
            }

            UUID businessId;
            try {
                businessId = UUID.fromString(businessIdStr);
            } catch (IllegalArgumentException e) {
                throw new ValidationException("Invalid refresh token: invalid business ID format");
            }

            return userRepository.findByUserIdentifierAndBusinessIdAndIsDeletedFalse(userIdentifier, businessId)
                    .orElseThrow(() -> new ValidationException("User not found for refresh token context"));
        }

        // For CUSTOMER and PLATFORM_USER
        return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userType)
                .orElseThrow(() -> new ValidationException("User not found for refresh token context"));
    }
}