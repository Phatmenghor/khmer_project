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
    public SocialAuthResponse authenticate(SocialAuthRequest authRequestData) {
        log.info("SOCIAL_AUTH_INITIATED: provider={}, user_type={}", authRequestData.getProvider(), authRequestData.getUserType());

        SocialAuthProvider authProviderEnum = SocialAuthProvider.fromProviderKey(authRequestData.getProvider());
        SocialUserInfo socialUserInfo = fetchUserInfo(authProviderEnum, authRequestData.getAccessToken());

        User userEntity = findOrCreateUser(socialUserInfo, authProviderEnum, authRequestData.getUserType(), authRequestData.getBusinessId());
        syncSocialData(userEntity, authProviderEnum, socialUserInfo);
        userRepository.save(userEntity);

        List<String> roleNames = userEntity.getRoles().stream().map(Role::getName).toList();
        String accessTokenString = jwtGenerator.generateAccessTokenFromUsername(
                userEntity.getUserIdentifier(),
                roleNames,
                userEntity.getUserType().name()
        );
        String refreshTokenString = refreshTokenService.createRefreshToken(
                userEntity, authRequestData.getIpAddress(), authRequestData.getDeviceInfo()).getToken();

        log.info("SOCIAL_AUTH_SUCCESS: identifier={}, provider={}, user_id={}", userEntity.getUserIdentifier(), authProviderEnum, userEntity.getId());

        return socialAuthResponseMapper.toResponse(userEntity, accessTokenString, refreshTokenString, authProviderEnum, socialUserInfo);
    }

    @Override
    public SocialSyncResponse syncSocialAccount(SocialAuthRequest syncRequestData) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("SOCIAL_ACCOUNT_SYNC_INITIATED: user_id={}, provider={}", currentUserId, syncRequestData.getProvider());

        User userEntity = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> {
                    log.warn("SOCIAL_ACCOUNT_SYNC_FAILED_USER_NOT_FOUND: user_id={}", currentUserId);
                    return new ValidationException("User not found");
                });

        SocialAuthProvider socialProvider = SocialAuthProvider.fromProviderKey(syncRequestData.getProvider());
        SocialUserInfo fetchedUserInfo = fetchUserInfo(socialProvider, syncRequestData.getAccessToken());

        syncSocialData(userEntity, socialProvider, fetchedUserInfo);
        userRepository.save(userEntity);

        log.info("SOCIAL_ACCOUNT_SYNC_SUCCESS: user_id={}, provider={}", currentUserId, socialProvider);

        return socialSyncResponseMapper.toResponse(userEntity, socialProvider);
    }

    @Override
    public SocialSyncResponse unsyncSocialAccount(String providerKey) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("SOCIAL_ACCOUNT_UNSYNC_INITIATED: user_id={}, provider={}", currentUserId, providerKey);

        User userEntity = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> {
                    log.warn("SOCIAL_ACCOUNT_UNSYNC_FAILED_USER_NOT_FOUND: user_id={}", currentUserId);
                    return new ValidationException("User not found");
                });

        SocialAuthProvider socialProvider = SocialAuthProvider.fromProviderKey(providerKey);

        switch (socialProvider) {
            case TELEGRAM -> userEntity.unsyncTelegram();
            default -> {
                log.warn("SOCIAL_ACCOUNT_UNSYNC_FAILED_UNSUPPORTED: user_id={}, provider={}", currentUserId, socialProvider);
                throw new ValidationException("Unsupported provider: " + socialProvider);
            }
        }

        userRepository.save(userEntity);
        log.info("SOCIAL_ACCOUNT_UNSYNC_SUCCESS: user_id={}, provider={}", currentUserId, socialProvider);

        return socialSyncResponseMapper.toUnsyncResponse(socialProvider);
    }

    private SocialUserInfo fetchUserInfo(SocialAuthProvider authProviderEnum, String accessTokenString) {
        if (authProviderEnum == SocialAuthProvider.TELEGRAM) {
            return telegramAuthProvider.getUserInfo(accessTokenString);
        }
        log.warn("FETCH_USER_INFO_FAILED_UNSUPPORTED: provider={}", authProviderEnum);
        throw new ValidationException("Unsupported provider: " + authProviderEnum);
    }

    private User findOrCreateUser(SocialUserInfo socialUserInfo, SocialAuthProvider authProviderEnum, UserType userTypeEnum, UUID businessIdValue) {
        return switch (authProviderEnum) {
            case TELEGRAM -> findOrCreateByTelegram(socialUserInfo, userTypeEnum, businessIdValue);
            default -> {
                log.warn("FIND_OR_CREATE_USER_FAILED_UNSUPPORTED: provider={}", authProviderEnum);
                throw new ValidationException("Unsupported provider: " + authProviderEnum);
            }
        };
    }

    private User findOrCreateByTelegram(SocialUserInfo socialUserInfo, UserType userTypeEnum, UUID businessIdValue) {
        Long telegramIdValue = Long.parseLong(socialUserInfo.getId());
        return userRepository.findByTelegramIdAndIsDeletedFalse(telegramIdValue)
                .orElseGet(() -> createNewUser(socialUserInfo, userTypeEnum, businessIdValue));
    }

    private User createNewUser(SocialUserInfo socialUserInfo, UserType userTypeEnum, UUID businessIdValue) {
        String generatedUserIdentifier = generateUserIdentifier(socialUserInfo, userTypeEnum);

        String defaultRoleName = switch (userTypeEnum) {
            case PLATFORM_USER -> "PLATFORM_OWNER";
            case BUSINESS_USER -> "BUSINESS_OWNER";
            case CUSTOMER -> "CUSTOMER";
        };

        Role defaultRoleEntity = roleRepository.findByNameAndIsDeletedFalse(defaultRoleName)
                .orElseThrow(() -> {
                    log.warn("CREATE_NEW_USER_FAILED_ROLE_NOT_FOUND: role_name={}, user_type={}", defaultRoleName, userTypeEnum);
                    return new ValidationException("Default role not found: " + defaultRoleName);
                });

        if (!defaultRoleEntity.isCompatibleWithUserType(userTypeEnum)) {
            log.warn("CREATE_NEW_USER_FAILED_ROLE_INCOMPATIBLE: role={}, user_type={}", defaultRoleName, userTypeEnum);
            throw new ValidationException(
                    String.format("Role '%s' is not properly configured for '%s'", defaultRoleName, userTypeEnum));
        }

        User newUserEntity = new User();
        newUserEntity.setUserIdentifier(generatedUserIdentifier);
        newUserEntity.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUserEntity.setUserType(userTypeEnum);
        newUserEntity.setAccountStatus(AccountStatus.ACTIVE);
        newUserEntity.setBusinessId(businessIdValue);
        newUserEntity.setRoles(List.of(defaultRoleEntity));

        UserProfile profileEntity = new UserProfile();
        profileEntity.setUser(newUserEntity);
        profileEntity.setEmail(socialUserInfo.getEmail());
        profileEntity.setFirstName(socialUserInfo.getFirstName());
        profileEntity.setLastName(socialUserInfo.getLastName());
        newUserEntity.setProfile(profileEntity);

        return userRepository.save(newUserEntity);
    }

    private void syncSocialData(User userEntity, SocialAuthProvider authProviderEnum, SocialUserInfo socialUserInfo) {
        if (authProviderEnum == SocialAuthProvider.TELEGRAM) {
            userEntity.syncTelegram(
                    Long.parseLong(socialUserInfo.getId()),
                    socialUserInfo.getUsername(),
                    socialUserInfo.getFirstName(),
                    socialUserInfo.getLastName(),
                    socialUserInfo.getPhotoUrl()
            );
        }
    }

    private String generateUserIdentifier(SocialUserInfo socialUserInfo, UserType userTypeEnum) {
        String baseIdentifier = socialUserInfo.getUsername() != null ? socialUserInfo.getUsername() :
                      socialUserInfo.getEmail() != null ? socialUserInfo.getEmail().split("@")[0] :
                      "user" + socialUserInfo.getId().substring(0, 8);
        String normalizedIdentifier = baseIdentifier.toLowerCase().replaceAll("[^a-z0-9_]", "");
        int suffixCounter = 1;
        String candidateIdentifier = normalizedIdentifier;
        while (userRepository.existsByUserIdentifierAndUserTypeAndIsDeletedFalse(candidateIdentifier, userTypeEnum)) {
            candidateIdentifier = normalizedIdentifier + suffixCounter++;
        }
        return candidateIdentifier;
    }
}
