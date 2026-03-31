package com.emenu.features.auth.service.impl;

import com.emenu.enums.social.SocialAuthProvider;
import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.Role;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.models.UserProfile;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.service.RefreshTokenService;
import com.emenu.features.auth.dto.request.SocialAuthRequest;
import com.emenu.features.auth.dto.response.SocialAuthResponse;
import com.emenu.features.auth.dto.response.SocialSyncResponse;
import com.emenu.features.auth.service.SocialAuthService;
import com.emenu.features.auth.service.social.provider.SocialUserInfo;
import com.emenu.features.auth.service.social.provider.TelegramAuthProvider;
import com.emenu.security.jwt.JWTGenerator;
import com.emenu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SocialAuthServiceImpl implements SocialAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TelegramAuthProvider telegramAuthProvider;
    private final JWTGenerator jwtGenerator;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    @Override
    public SocialAuthResponse authenticate(SocialAuthRequest request) {

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(request.getProvider());
        SocialUserInfo userInfo = fetchUserInfo(provider, request.getAccessToken());

        User user = findOrCreateUser(userInfo, provider, request.getUserType(), request.getBusinessId());
        syncSocialData(user, provider, userInfo);
        userRepository.save(user);

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String accessToken = jwtGenerator.generateAccessTokenFromUsername(user.getUserIdentifier(), roles);
        String refreshToken = refreshTokenService.createRefreshToken(
                user, request.getIpAddress(), request.getDeviceInfo()).getToken();


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

        User user = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new ValidationException("User not found"));

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(request.getProvider());
        SocialUserInfo userInfo = fetchUserInfo(provider, request.getAccessToken());

        syncSocialData(user, provider, userInfo);
        userRepository.save(user);

        Long tgId = user.getTelegram() != null ? user.getTelegram().getTelegramId() : null;
        String tgUsername = user.getTelegram() != null ? user.getTelegram().getTelegramUsername() : null;

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
        }

        return builder.build();
    }

    @Override
    public SocialSyncResponse unsyncSocialAccount(String providerKey) {
        UUID currentUserId = securityUtils.getCurrentUserId();

        User user = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new ValidationException("User not found"));

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(providerKey);

        switch (provider) {
            case TELEGRAM -> {
                Long tgId = user.getTelegram() != null ? user.getTelegram().getTelegramId() : null;
                user.unsyncTelegram();
            }
            default -> throw new ValidationException("Unsupported provider: " + provider);
        }

        userRepository.save(user);

        return SocialSyncResponse.builder()
                .success(true)
                .message(provider.getDisplayName() + " account unsynced successfully")
                .provider(provider.getProviderKey())
                .build();
    }

    private SocialUserInfo fetchUserInfo(SocialAuthProvider provider, String accessToken) {
        if (provider == SocialAuthProvider.TELEGRAM) {
            return telegramAuthProvider.getUserInfo(accessToken);
        }
        throw new ValidationException("Unsupported provider: " + provider);
    }

    private User findOrCreateUser(SocialUserInfo userInfo, SocialAuthProvider provider, UserType userType, UUID businessId) {
        return switch (provider) {
            case TELEGRAM -> findOrCreateByTelegram(userInfo, userType, businessId);
            default -> throw new ValidationException("Unsupported provider: " + provider);
        };
    }

    private User findOrCreateByTelegram(SocialUserInfo userInfo, UserType userType, UUID businessId) {
        Long telegramId = Long.parseLong(userInfo.getId());
        return userRepository.findByTelegramIdAndIsDeletedFalse(telegramId)
                .orElseGet(() -> createNewUser(userInfo, userType, businessId));
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

        if (!role.isCompatibleWithUserType(userType)) {
            throw new ValidationException(
                    String.format("Role '%s' is not properly configured for '%s'", defaultRole, userType));
        }

        User user = new User();
        user.setUserIdentifier(userIdentifier);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setUserType(userType);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setBusinessId(businessId);
        user.setRoles(List.of(role));

        // Create profile with social info
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setEmail(userInfo.getEmail());
        profile.setFirstName(userInfo.getFirstName());
        profile.setLastName(userInfo.getLastName());
        user.setProfile(profile);

        return userRepository.save(user);
    }

    private void syncSocialData(User user, SocialAuthProvider provider, SocialUserInfo userInfo) {
        if (provider == SocialAuthProvider.TELEGRAM) {
            user.syncTelegram(
                    Long.parseLong(userInfo.getId()),
                    userInfo.getUsername(),
                    userInfo.getFirstName(),
                    userInfo.getLastName(),
                    userInfo.getPhotoUrl()
            );
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
            candidate = identifier + suffix++;
        }
        return candidate;
    }
}
