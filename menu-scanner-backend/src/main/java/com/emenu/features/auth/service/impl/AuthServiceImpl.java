package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.request.AdminPasswordResetRequest;
import com.emenu.features.auth.dto.request.LoginRequest;
import com.emenu.features.auth.dto.request.PasswordChangeRequest;
import com.emenu.features.auth.dto.request.QuickRegisterRequest;
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
import com.emenu.shared.constants.BusinessConstants;
import com.emenu.shared.utils.TokenUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.emenu.enums.common.StockStatus;
import com.emenu.enums.common.Status;
import com.emenu.enums.payment.PaymentOptionType;
import com.emenu.enums.user.BusinessStatus;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.order.models.BusinessExchangeRate;
import com.emenu.features.order.models.DeliveryOption;
import com.emenu.features.order.models.PaymentOption;
import com.emenu.features.order.repository.BusinessExchangeRateRepository;
import com.emenu.features.order.repository.DeliveryOptionRepository;
import com.emenu.features.order.repository.PaymentOptionRepository;
import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import com.emenu.features.portfolio.models.PortfolioProfile;
import com.emenu.features.portfolio.repository.PortfolioProfileRepository;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BusinessRepository businessRepository;
    private final BusinessSettingRepository businessSettingRepository;
    private final BusinessExchangeRateRepository businessExchangeRateRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final PaymentOptionRepository paymentOptionRepository;
    private final PortfolioProfileRepository portfolioProfileRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
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
        } else if (userEntity.isCustomer() && userEntity.getBusinessId() != null) {
            validateCustomerBusinessStatus(userEntity.getBusinessId());
        } else if (userEntity.isPlatformUser()) {
            log.info("Platform user login context validated for user_id={}", userEntity.getId());
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
                if (businessEntity.getSubscriptions() != null) {
                    businessEntity.getSubscriptions().stream()
                            .filter(Subscription::isActive)
                            .findFirst()
                            .ifPresent(sub -> loginResponse.setSubscriptionRemainingDays(sub.getDaysRemaining()));
                }
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
            log.info("Business subscription is active: business_id={}", userEntity.getBusinessId());
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

        if (userTypeEnum != null) {
            if (userTypeEnum == UserType.BUSINESS_USER || userTypeEnum == UserType.CUSTOMER) {
                if (businessIdValue != null) {
                    Optional<User> userInBusiness = userRepository.findByUserIdentifierAndUserTypeAndBusinessIdAndIsDeletedFalse(userIdentifier, userTypeEnum, businessIdValue);
                    if (userInBusiness.isPresent()) {
                        return userInBusiness.get();
                    }
                }
            }

            Optional<User> userTyped = userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userTypeEnum);
            if (userTyped.isPresent()) {
                return userTyped.get();
            }
        }

        // Fallback lookup: search by userIdentifier alone regardless of specified userType
        Optional<User> userByIdentifier = userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier);
        if (userByIdentifier.isPresent()) {
            User foundUser = userByIdentifier.get();
            // Allow PLATFORM_USER or BUSINESS_USER (portal users) to log in seamlessly
            if (foundUser.isPlatformUser() || foundUser.isBusinessUser() || userTypeEnum == null) {
                return foundUser;
            }
        }

        log.warn("User login failed - user not found: identifier={}, type={}", userIdentifier, userTypeEnum);
        String userTypeLabel = userTypeEnum != null ? userTypeEnum.name().toLowerCase().replace("_", " ") : "account";
        throw new ValidationException(
                "Account not found as " + userTypeLabel + ". Please check your user identifier and ensure you're logging in with the correct account type."
        );
    }

    private void validateLoginContext(LoginRequest loginRequestData, User userEntity) {
        if (loginRequestData.getUserType() != null && !loginRequestData.getUserType().equals(userEntity.getUserType())) {
            boolean isPortalUser = (userEntity.isPlatformUser() || userEntity.isBusinessUser()) &&
                                   (loginRequestData.getUserType() == UserType.BUSINESS_USER || loginRequestData.getUserType() == UserType.PLATFORM_USER);
            if (!isPortalUser) {
                log.warn("User login failed - user type mismatch: expected={}, found={}", loginRequestData.getUserType(), userEntity.getUserType());
                throw new ValidationException(
                        "User type mismatch. Expected: " + loginRequestData.getUserType() +
                                ", Found: " + userEntity.getUserType()
                );
            }
        }

        if (userEntity.isBusinessUser() || userEntity.isCustomer()) {
            if (loginRequestData.getBusinessId() != null && userEntity.getBusinessId() != null) {
                if (!loginRequestData.getBusinessId().equals(userEntity.getBusinessId())) {
                    log.warn("User login failed - business mismatch: user_id={}, expected_business={}, user_business={}",
                            userEntity.getId(), loginRequestData.getBusinessId(), userEntity.getBusinessId());
                    throw new ValidationException("User does not belong to the specified business");
                }
            }
        }
    }

    @Override
    public UserResponse registerCustomer(RegisterRequest registrationRequestData) {
        log.info("Customer registration initiated: identifier={}, business_id={}", registrationRequestData.getUserIdentifier(), registrationRequestData.getBusinessId());

        userValidationService.validateUsernameUniqueness(
                registrationRequestData.getUserIdentifier(),
                UserType.CUSTOMER,
                registrationRequestData.getBusinessId()
        );

        User userEntity = userMapper.toEntity(registrationRequestData);
        userEntity.setUserType(UserType.CUSTOMER);
        userEntity.setBusinessId(registrationRequestData.getBusinessId());
        userEntity.setPassword(passwordEncoder.encode(registrationRequestData.getPassword()));

        Role customerRoleEntity = getOrCreateCustomerRole(registrationRequestData.getBusinessId());
        userEntity.setRoles(List.of(customerRoleEntity));

        User savedUserEntity = userRepository.save(userEntity);

        log.info("Customer registration completed successfully: identifier={}, user_id={}", savedUserEntity.getUserIdentifier(), savedUserEntity.getId());
        return userMapper.toResponse(savedUserEntity);
    }

    @Override
    public UserResponse registerQuickUser(QuickRegisterRequest registrationRequestData) {
        log.info("Quick user registration initiated: identifier={}", registrationRequestData.getUserIdentifier());

        // 1. Create default Business entity for this new Business Owner
        Business businessEntity = new Business();
        String businessName = extractBusinessNameFromIdentifier(registrationRequestData.getUserIdentifier());
        businessEntity.setName(businessName);
        businessEntity.setSubdomain(slugifyQuickBusiness(businessName));
        businessEntity.setStatus(BusinessStatus.ACTIVE);
        Business savedBusinessEntity = businessRepository.save(businessEntity);

        // 2. Ensure user identifier is not duplicated within this new business
        if (userRepository.existsByUserIdentifierAndUserTypeAndBusinessIdAndIsDeletedFalse(
                registrationRequestData.getUserIdentifier(),
                UserType.BUSINESS_USER,
                savedBusinessEntity.getId())) {
            log.warn("Quick registration failed - duplicate username for business: identifier={}", registrationRequestData.getUserIdentifier());
            throw new ValidationException("This username is already taken. Please choose another username or sign in.");
        }

        // 3. Create Business Owner User linked to the new business ID
        User userEntity = new User();
        userEntity.setUserIdentifier(registrationRequestData.getUserIdentifier());
        userEntity.setPassword(passwordEncoder.encode(registrationRequestData.getPassword()));
        userEntity.setUserType(UserType.BUSINESS_USER);
        userEntity.setAccountStatus(AccountStatus.ACTIVE);
        userEntity.setBusinessId(savedBusinessEntity.getId());

        Role defaultRole = getOrCreateBusinessUserRole();
        userEntity.setRoles(List.of(defaultRole));

        User savedUserEntity = userRepository.save(userEntity);

        // Link Owner ID to Business
        savedBusinessEntity.setOwnerId(savedUserEntity.getId());
        businessRepository.save(savedBusinessEntity);

        // 4. Initialize default business settings, rates, delivery & payment options
        initializeQuickUserBusinessDefaults(savedBusinessEntity.getId());

        // 5. Attach 7-Day Free Trial Subscription
        createQuickUser7DayTrialSubscription(savedBusinessEntity);

        log.info("Quick user registration completed successfully: identifier={}, user_id={}, business_id={}",
                savedUserEntity.getUserIdentifier(), savedUserEntity.getId(), savedBusinessEntity.getId());
        return userMapper.toResponse(savedUserEntity);
    }

    private void validateCustomerBusinessStatus(UUID businessId) {
        Business businessEntity = businessRepository.findById(businessId).orElse(null);
        if (businessEntity != null && !businessEntity.isActive()) {
            log.warn("Customer login blocked - business not active: business_id={}, status={}", businessId, businessEntity.getStatus());
            throw new ValidationException("This store is currently inactive or suspended. E-Menu Client access is unavailable.");
        }
    }

    private String extractBusinessNameFromIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return "My Store";
        String raw = identifier.contains("@") ? identifier.substring(0, identifier.indexOf("@")) : identifier;
        raw = raw.replaceAll("[._-]", " ").trim();
        if (raw.isEmpty()) return "My Store";
        String[] words = raw.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim() + " Store";
    }

    private String slugifyQuickBusiness(String name) {
        if (name == null) return "store-" + UUID.randomUUID().toString().substring(0, 6);
        String base = name.trim().toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
        if (base.isEmpty()) base = "store";
        if (!businessRepository.existsBySubdomainAndIsDeletedFalse(base)) {
            return base;
        }
        return base + "-" + UUID.randomUUID().toString().substring(0, 6);
    }

    private void initializeQuickUserBusinessDefaults(UUID businessId) {
        if (businessSettingRepository != null) {
            BusinessSetting businessSetting = new BusinessSetting();
            businessSetting.setBusinessId(businessId);
            businessSetting.setTaxPercentage(BusinessConstants.DEFAULT_TAX_PERCENTAGE);
            businessSetting.setLowStockThreshold(BusinessConstants.DEFAULT_LOW_STOCK_THRESHOLD);
            businessSetting.setEnableStock(StockStatus.DISABLED);
            businessSetting.setStoreDescription(BusinessConstants.DEFAULT_STORE_DESCRIPTION);
            businessSettingRepository.save(businessSetting);
        }

        if (portfolioProfileRepository != null) {
            PortfolioProfile portfolioProfile = new PortfolioProfile();
            portfolioProfile.setBusinessId(businessId);
            portfolioProfileRepository.save(portfolioProfile);
        }

        if (businessExchangeRateRepository != null) {
            BusinessExchangeRate exchangeRate = new BusinessExchangeRate();
            exchangeRate.setBusinessId(businessId);
            exchangeRate.setUsdToKhrRate(4000.0);
            exchangeRate.setStatus(BusinessExchangeRate.ExchangeRateStatus.ACTIVE);
            businessExchangeRateRepository.save(exchangeRate);
        }

        if (deliveryOptionRepository != null) {
            DeliveryOption deliveryOption = new DeliveryOption();
            deliveryOption.setBusinessId(businessId);
            deliveryOption.setName("Store Pickup");
            deliveryOption.setStatus(Status.ACTIVE);
            deliveryOption.setPrice(BigDecimal.ZERO);
            deliveryOptionRepository.save(deliveryOption);
        }

        if (paymentOptionRepository != null) {
            PaymentOption bankPaymentOption = new PaymentOption();
            bankPaymentOption.setBusinessId(businessId);
            bankPaymentOption.setName("Bank Transfer");
            bankPaymentOption.setPaymentOptionType(PaymentOptionType.BANK);
            bankPaymentOption.setStatus(Status.ACTIVE);
            paymentOptionRepository.save(bankPaymentOption);

            PaymentOption cashPaymentOption = new PaymentOption();
            cashPaymentOption.setBusinessId(businessId);
            cashPaymentOption.setName("Cash");
            cashPaymentOption.setPaymentOptionType(PaymentOptionType.CASH);
            cashPaymentOption.setStatus(Status.ACTIVE);
            paymentOptionRepository.save(cashPaymentOption);
        }
    }

    private void createQuickUser7DayTrialSubscription(Business business) {
        if (subscriptionRepository != null && planRepository != null) {
            List<SubscriptionPlan> activePlans = planRepository.findAllActivePlans();
            Optional<SubscriptionPlan> trialPlanOpt = activePlans.stream()
                    .filter(p -> p.getDurationType() != null && p.getDurationType() == SubscriptionPlanDurationType.FREE_TRIAL)
                    .findFirst();

            if (trialPlanOpt.isEmpty()) {
                log.warn("Quick registration: No active FREE_TRIAL subscription plan configured in database by owner.");
                return;
            }

            SubscriptionPlan trialPlan = trialPlanOpt.get();
            Subscription subscription = new Subscription();
            subscription.setBusinessId(business.getId());
            subscription.setPlan(trialPlan);
            subscription.setPlanId(trialPlan.getId());
            subscription.setStartDate(LocalDateTime.now());
            subscription.setEndDate(LocalDateTime.now().plusDays(7));
            subscription.setAutoRenew(false);

            subscriptionRepository.save(subscription);
            business.activateSubscription();
            businessRepository.save(business);
        }
    }

    private Role getOrCreateBusinessUserRole() {
        List<Role> systemRoles = roleRepository.findSystemRolesByName("BUSINESS_OWNER");
        if (!systemRoles.isEmpty()) {
            return systemRoles.get(0);
        }

        Optional<Role> anyRole = roleRepository.findByNameAndIsDeletedFalse("BUSINESS_OWNER");
        if (anyRole.isPresent()) {
            return anyRole.get();
        }

        Role defaultRole = new Role();
        defaultRole.setName("BUSINESS_OWNER");
        defaultRole.setDescription("Default Business Owner Role");
        defaultRole.setUserType(UserType.BUSINESS_USER);
        return roleRepository.save(defaultRole);
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
            log.info("User type {} requires only account status validation", userEntity.getUserType());
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

        if (userTypeEnum == UserType.BUSINESS_USER || userTypeEnum == UserType.CUSTOMER) {
            if (businessIdString != null && !businessIdString.isBlank()) {
                try {
                    UUID businessIdValue = UUID.fromString(businessIdString);
                    Optional<User> userInBusiness = userRepository.findByUserIdentifierAndUserTypeAndBusinessIdAndIsDeletedFalse(userIdentifier, userTypeEnum, businessIdValue);
                    if (userInBusiness.isPresent()) {
                        return userInBusiness.get();
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Refresh token validation - invalid business ID format: business_id_string={}", businessIdString);
                }
            }
        }

        return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userTypeEnum)
                .orElseThrow(() -> {
                    log.warn("Refresh token validation failed - user not found: identifier={}, type={}", userIdentifier, userTypeEnum);
                    return new ValidationException("User not found for refresh token context");
                });
    }

    private Role getOrCreateCustomerRole(UUID businessId) {
        if (businessId != null) {
            Optional<Role> businessRole = roleRepository.findByNameAndBusinessIdAndIsDeletedFalse("CUSTOMER", businessId);
            if (businessRole.isPresent()) {
                return businessRole.get();
            }
        }

        List<Role> systemRoles = roleRepository.findSystemRolesByName("CUSTOMER");
        if (!systemRoles.isEmpty()) {
            return systemRoles.get(0);
        }

        Optional<Role> anyRole = roleRepository.findByNameAndIsDeletedFalse("CUSTOMER");
        if (anyRole.isPresent()) {
            return anyRole.get();
        }

        log.info("Auto-creating default CUSTOMER role for business: business_id={}", businessId);
        Role customerRole = new Role();
        customerRole.setName("CUSTOMER");
        customerRole.setDescription("Default Customer Role");
        customerRole.setUserType(UserType.CUSTOMER);
        customerRole.setBusinessId(businessId);
        return roleRepository.save(customerRole);
    }
}