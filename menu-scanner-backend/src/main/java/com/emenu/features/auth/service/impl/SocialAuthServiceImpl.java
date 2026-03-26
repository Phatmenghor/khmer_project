package com.emenu.features.auth.service.impl;

import com.emenu.enums.social.SocialAuthProvider;
import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.Role;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.service.RefreshTokenService;
import com.emenu.features.auth.dto.request.SocialAuthRequest;
import com.emenu.features.auth.dto.response.SocialAuthResponse;
import com.emenu.features.auth.dto.response.SocialSyncResponse;
import com.emenu.features.auth.service.SocialAuthService;
import com.emenu.features.auth.service.social.provider.GoogleAuthProvider;
import com.emenu.features.auth.service.social.provider.SocialUserInfo;
import com.emenu.features.auth.service.social.provider.TelegramAuthProvider;
import com.emenu.security.jwt.JWTGenerator;
import com.emenu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SocialAuthServiceImpl implements SocialAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TelegramAuthProvider telegramAuthProvider;
    private final GoogleAuthProvider googleAuthProvider;
    private final JWTGenerator jwtGenerator;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    @Override
    public SocialAuthResponse authenticate(SocialAuthRequest request) {
        log.info("Social auth: provider={}, userType={}", request.getProvider(), request.getUserType());

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(request.getProvider());
        SocialUserInfo userInfo = fetchUserInfo(provider, request.getAccessToken());

        User user = findOrCreateUser(userInfo, provider, request.getUserType(), request.getBusinessId());

        syncSocialData(user, provider, userInfo);
        userRepository.save(user);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        String accessToken = jwtGenerator.generateAccessTokenFromUsername(user.getUserIdentifier(), roles);
        String refreshToken = refreshTokenService.createRefreshToken(
                user, request.getIpAddress(), request.getDeviceInfo()
        ).getToken();

        log.info("Social auth successful: user={}, provider={}", user.getUserIdentifier(), provider);

        return SocialAuthResponse.builder()
                .success(true)
                .message("Authentication successful")
                .provider(provider)
                .userId(user.getId())
                .userIdentifier(user.getUserIdentifier())
                .userType(user.getUserType().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .socialId(userInfo.getId())
                .socialUsername(userInfo.getUsername())
                .syncedAt(java.time.LocalDateTime.now())
                .operationType(user.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusSeconds(5)) ? "register" : "login")
                .isNewUser(user.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusSeconds(5)))
                .build();
    }

    @Override
    public SocialSyncResponse syncSocialAccount(SocialAuthRequest request) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("## [SYNC SERVICE] ▶ Starting sync: userId={}, provider={}", currentUserId, request.getProvider());

        User user = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new ValidationException("User not found"));
        log.info("## [SYNC SERVICE] ✓ Found user: identifier={}, userType={}", user.getUserIdentifier(), user.getUserType());

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(request.getProvider());
        log.info("## [SYNC SERVICE] ▶ Fetching user info from provider: {}", provider);
        SocialUserInfo userInfo = fetchUserInfo(provider, request.getAccessToken());
        log.info("## [SYNC SERVICE] ✓ Provider info fetched: id={}, username={}", userInfo.getId(), userInfo.getUsername());

        log.info("## [SYNC SERVICE] ▶ Syncing social data to user entity...");
        syncSocialData(user, provider, userInfo);
        userRepository.save(user);
        log.info("## [SYNC SERVICE] ✓ User saved: telegramId={}, telegramUsername={}, hasPhoto={}",
                user.getTelegramId(), user.getTelegramUsername(), user.getTelegramPhotoUrl() != null);

        SocialSyncResponse.SocialSyncResponseBuilder builder = SocialSyncResponse.builder()
                .success(true)
                .message(provider.getDisplayName() + " account synced successfully")
                .provider(provider.getProviderKey())
                .syncedAt(java.time.LocalDateTime.now());

        if (provider == SocialAuthProvider.TELEGRAM) {
            builder.telegramId(Long.parseLong(userInfo.getId()))
                    .telegramUsername(userInfo.getUsername())
                    .telegramFirstName(userInfo.getFirstName())
                    .telegramLastName(userInfo.getLastName())
                    .telegramPhotoUrl(userInfo.getPhotoUrl());
        } else if (provider == SocialAuthProvider.GOOGLE) {
            builder.googleId(userInfo.getId())
                    .googleEmail(userInfo.getEmail());
        }

        return builder.build();
    }

    @Override
    public SocialSyncResponse unsyncSocialAccount(String providerKey) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("## [UNSYNC SERVICE] ▶ Starting unsync: userId={}, provider={}", currentUserId, providerKey);

        User user = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new ValidationException("User not found"));
        log.info("## [UNSYNC SERVICE] ✓ Found user: identifier={}", user.getUserIdentifier());

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(providerKey);

        switch (provider) {
            case TELEGRAM -> {
                log.info("## [UNSYNC SERVICE] ▶ Clearing Telegram fields (was telegramId={})", user.getTelegramId());
                user.unsyncTelegram();
            }
            case GOOGLE -> {
                log.info("## [UNSYNC SERVICE] ▶ Clearing Google fields (was googleId={})", user.getGoogleId());
                user.unsyncGoogle();
            }
            default -> throw new ValidationException("Unsupported provider: " + provider);
        }

        userRepository.save(user);
        log.info("## [UNSYNC SERVICE] ✓ User saved, {} unsynced successfully", providerKey);

        return SocialSyncResponse.builder()
                .success(true)
                .message(provider.getDisplayName() + " account unsynced successfully")
                .provider(provider.getProviderKey())
                .build();
    }

    private SocialUserInfo fetchUserInfo(SocialAuthProvider provider, String accessToken) {
        return switch (provider) {
            case TELEGRAM -> telegramAuthProvider.getUserInfo(accessToken);
            case GOOGLE -> googleAuthProvider.getUserInfo(accessToken);
            default -> throw new ValidationException("Provider not yet implemented: " + provider);
        };
    }

    private User findOrCreateUser(SocialUserInfo userInfo, SocialAuthProvider provider, 
                                   UserType userType, UUID businessId) {
        return switch (provider) {
            case TELEGRAM -> findOrCreateByTelegram(userInfo, userType, businessId);
            case GOOGLE -> findOrCreateByGoogle(userInfo, userType, businessId);
            default -> throw new ValidationException("Provider not yet implemented: " + provider);
        };
    }

    private User findOrCreateByTelegram(SocialUserInfo userInfo, UserType userType, UUID businessId) {
        Long telegramId = Long.parseLong(userInfo.getId());

        return userRepository.findByTelegramIdAndIsDeletedFalse(telegramId)
                .orElseGet(() -> createNewUser(userInfo, userType, businessId));
    }

    private User findOrCreateByGoogle(SocialUserInfo userInfo, UserType userType, UUID businessId) {
        if (userType == UserType.BUSINESS_USER && businessId != null) {
            return userRepository.findByGoogleIdAndUserTypeAndBusinessIdAndIsDeletedFalse(
                    userInfo.getId(), userType, businessId
            ).orElseGet(() -> createNewUser(userInfo, userType, businessId));
        } else {
            return userRepository.findByGoogleIdAndUserTypeAndIsDeletedFalse(userInfo.getId(), userType)
                    .orElseGet(() -> createNewUser(userInfo, userType, businessId));
        }
    }

    private User createNewUser(SocialUserInfo userInfo, UserType userType, UUID businessId) {
        String userIdentifier = generateUserIdentifier(userInfo, userType);

        String defaultRole = switch (userType) {
            case PLATFORM_USER -> "PLATFORM_OWNER";
            case BUSINESS_USER -> "BUSINESS_OWNER";
            case CUSTOMER -> "CUSTOMER";
        };

        Role role = roleRepository.findByNameAndIsDeletedFalse(defaultRole)
                .orElseThrow(() -> new ValidationException("Default role not found: " + defaultRole));

        // Validate role is compatible with the user type
        if (!role.isCompatibleWithUserType(userType)) {
            throw new ValidationException(
                    String.format("Role '%s' is not properly configured for '%s' user type", defaultRole, userType)
            );
        }

        User user = new User();
        user.setUserIdentifier(userIdentifier);
        user.setEmail(userInfo.getEmail());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setFirstName(userInfo.getFirstName());
        user.setLastName(userInfo.getLastName());
        user.setUserType(userType);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setBusinessId(businessId);
        user.setRoles(List.of(role));

        return userRepository.save(user);
    }

    private void syncSocialData(User user, SocialAuthProvider provider, SocialUserInfo userInfo) {
        switch (provider) {
            case TELEGRAM -> user.syncTelegram(
                    Long.parseLong(userInfo.getId()),
                    userInfo.getUsername(),
                    userInfo.getFirstName(),
                    userInfo.getLastName(),
                    userInfo.getPhotoUrl()
            );
            case GOOGLE -> user.syncGoogle(userInfo.getId(), userInfo.getEmail());
        }
    }

    private String generateUserIdentifier(SocialUserInfo userInfo, UserType userType) {
        String base = userInfo.getUsername() != null ? userInfo.getUsername() :
                      userInfo.getEmail() != null ? userInfo.getEmail().split("@")[0] :
                      "user" + userInfo.getId().substring(0, 8);

        String identifier = base.toLowerCase().replaceAll("[^a-z0-9_]", "");
        
        int suffix = 1;
        String candidate = identifier;
        while (userRepository.existsByUserIdentifierAndUserTypeAndIsDeletedFalse(candidate, userType)) {
            candidate = identifier + suffix;
            suffix++;
        }
        
        return candidate;
    }
}
