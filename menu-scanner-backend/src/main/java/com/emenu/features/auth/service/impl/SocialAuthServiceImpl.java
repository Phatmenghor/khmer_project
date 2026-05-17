package com.emenu.features.auth.service.impl;

import com.emenu.enums.social.SocialAuthProvider;
import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.mapper.SocialAuthResponseMapper;
import com.emenu.features.auth.mapper.SocialSyncResponseMapper;
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
    private final JWTGenerator jwtGenerator;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;
    private final SocialAuthResponseMapper socialAuthResponseMapper;
    private final SocialSyncResponseMapper socialSyncResponseMapper;

    @Override
    public SocialAuthResponse authenticate(SocialAuthRequest request) {
        log.info("Social authentication: provider={}, userType={}", request.getProvider(), request.getUserType());

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(request.getProvider());
        SocialUserInfo userInfo = fetchUserInfo(provider, request.getAccessToken());

        User user = findOrCreateUser(userInfo, provider, request.getUserType(), request.getBusinessId());
        syncSocialData(user, provider, userInfo);
        userRepository.save(user);

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String accessToken = jwtGenerator.generateAccessTokenFromUsername(
                user.getUserIdentifier(),
                roles,
                user.getUserType().name()
        );
        String refreshToken = refreshTokenService.createRefreshToken(
                user, request.getIpAddress(), request.getDeviceInfo()).getToken();

        log.info("Social authentication successful: user={}, provider={}", user.getUserIdentifier(), provider);

        return socialAuthResponseMapper.toResponse(user, accessToken, refreshToken, provider, userInfo);
    }

    @Override
    public SocialSyncResponse syncSocialAccount(SocialAuthRequest request) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("Social account sync: userId={}, provider={}", currentUserId, request.getProvider());

        User user = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new ValidationException("User not found"));

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(request.getProvider());
        SocialUserInfo userInfo = fetchUserInfo(provider, request.getAccessToken());

        syncSocialData(user, provider, userInfo);
        userRepository.save(user);

        log.info("Social account synced: userId={}, provider={}", currentUserId, provider);

        return socialSyncResponseMapper.toResponse(user, provider);
    }

    @Override
    public SocialSyncResponse unsyncSocialAccount(String providerKey) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("Social account unsync: userId={}, provider={}", currentUserId, providerKey);

        User user = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new ValidationException("User not found"));

        SocialAuthProvider provider = SocialAuthProvider.fromProviderKey(providerKey);

        switch (provider) {
            case TELEGRAM -> user.unsyncTelegram();
            default -> throw new ValidationException("Unsupported provider: " + provider);
        }

        userRepository.save(user);
        log.info("Social account unsynced: userId={}, provider={}", currentUserId, provider);

        return socialSyncResponseMapper.toUnsyncResponse(provider);
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
