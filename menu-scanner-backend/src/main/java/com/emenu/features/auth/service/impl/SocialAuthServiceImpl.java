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
import java.util.Optional;
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
        log.info("Social authentication initiated: provider={}, user_type={}", authRequestData.getProvider(), authRequestData.getUserType());

        SocialAuthProvider authProviderEnum = SocialAuthProvider.fromProviderKey(authRequestData.getProvider());
        SocialUserInfo socialUserInfo = fetchUserInfo(authProviderEnum, authRequestData.getAccessToken());

        User userEntity = findOrCreateUser(socialUserInfo, authProviderEnum, authRequestData.getUserType(), authRequestData.getBusinessId());
        syncSocialData(userEntity, authProviderEnum, socialUserInfo);
        userRepository.save(userEntity);

        List<String> roleNames = userEntity.getRoles().stream().map(Role::getName).toList();
        String accessTokenString = jwtGenerator.generateAccessTokenFromUsername(
                userEntity.getUserIdentifier(),
                roleNames,
                userEntity.getUserType().name(),
                userEntity.getId().toString(),
                userEntity.getUserIdentifier()
        );
        String refreshTokenString = refreshTokenService.createRefreshToken(
                userEntity, authRequestData.getIpAddress(), authRequestData.getDeviceInfo()).getToken();

        log.info("Social authentication completed successfully: identifier={}, provider={}, user_id={}", userEntity.getUserIdentifier(), authProviderEnum, userEntity.getId());

        return socialAuthResponseMapper.toResponse(userEntity, accessTokenString, refreshTokenString, authProviderEnum, socialUserInfo);
    }

    @Override
    public SocialSyncResponse getSocialSyncStatus() {
        UUID currentUserId = securityUtils.getCurrentUserId();
        User userEntity = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new ValidationException("User not found"));
        return socialSyncResponseMapper.toResponse(userEntity, SocialAuthProvider.TELEGRAM);
    }

    @Override
    public SocialSyncResponse syncSocialAccount(SocialAuthRequest syncRequestData) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("Social account synchronization initiated: user_id={}, provider={}", currentUserId, syncRequestData.getProvider());

        User userEntity = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> {
                    log.warn("Social account synchronization failed - user not found: user_id={}", currentUserId);
                    return new ValidationException("User not found");
                });

        SocialAuthProvider socialProvider = SocialAuthProvider.fromProviderKey(syncRequestData.getProvider());
        SocialUserInfo fetchedUserInfo = fetchUserInfo(socialProvider, syncRequestData.getAccessToken());

        syncSocialData(userEntity, socialProvider, fetchedUserInfo);
        userRepository.save(userEntity);

        log.info("Social account synchronized successfully: user_id={}, provider={}", currentUserId, socialProvider);

        return socialSyncResponseMapper.toResponse(userEntity, socialProvider);
    }

    @Override
    public SocialSyncResponse unsyncSocialAccount(String providerKey) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.info("Social account desynchronization initiated: user_id={}, provider={}", currentUserId, providerKey);

        User userEntity = userRepository.findByIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> {
                    log.warn("Social account desynchronization failed - user not found: user_id={}", currentUserId);
                    return new ValidationException("User not found");
                });

        SocialAuthProvider socialProvider = SocialAuthProvider.fromProviderKey(providerKey);

        switch (socialProvider) {
            case TELEGRAM -> userEntity.unsyncTelegram();
            default -> {
                log.warn("Social account desynchronization failed - unsupported provider: user_id={}, provider={}", currentUserId, socialProvider);
                throw new ValidationException("Unsupported provider: " + socialProvider);
            }
        }

        userRepository.save(userEntity);
        log.info("Social account desynchronized successfully: user_id={}, provider={}", currentUserId, socialProvider);

        return socialSyncResponseMapper.toUnsyncResponse(socialProvider);
    }

    private SocialUserInfo fetchUserInfo(SocialAuthProvider authProviderEnum, String accessTokenString) {
        if (authProviderEnum == SocialAuthProvider.TELEGRAM) {
            return telegramAuthProvider.getUserInfo(accessTokenString);
        }
        log.warn("User information fetch failed - unsupported provider: provider={}", authProviderEnum);
        throw new ValidationException("Unsupported provider: " + authProviderEnum);
    }

    private User findOrCreateUser(SocialUserInfo socialUserInfo, SocialAuthProvider authProviderEnum, UserType userTypeEnum, UUID businessIdValue) {
        return switch (authProviderEnum) {
            case TELEGRAM -> findOrCreateByTelegram(socialUserInfo, userTypeEnum, businessIdValue);
            default -> {
                log.warn("User creation failed - unsupported social provider: provider={}", authProviderEnum);
                throw new ValidationException("Unsupported provider: " + authProviderEnum);
            }
        };
    }

    private User findOrCreateByTelegram(SocialUserInfo socialUserInfo, UserType userTypeEnum, UUID businessIdValue) {
        Long telegramIdValue = Long.parseLong(socialUserInfo.getId());

        if (userTypeEnum == UserType.BUSINESS_USER) {
            if (businessIdValue == null) {
                log.warn("Telegram login rejected - businessId is required for BUSINESS_USER: telegram_id={}", telegramIdValue);
                throw new ValidationException("Business ID is required for business user login.");
            }
            return userRepository.findByTelegramIdAndBusinessIdAndIsDeletedFalse(telegramIdValue, businessIdValue)
                    .orElseThrow(() -> {
                        log.warn("Telegram login rejected - no linked account found for business user: telegram_id={}, business_id={}", telegramIdValue, businessIdValue);
                        return new ValidationException("Telegram account not linked. Please sync your Telegram account from your profile settings first.");
                    });
        }

        if (userTypeEnum == UserType.PLATFORM_USER) {
            return userRepository.findByTelegramIdAndUserTypeAndIsDeletedFalse(telegramIdValue, UserType.PLATFORM_USER)
                    .orElseGet(() -> createNewUser(socialUserInfo, userTypeEnum, null));
        }

        // CUSTOMER: unique per business
        if (businessIdValue != null) {
            return userRepository.findByTelegramIdAndBusinessIdAndIsDeletedFalse(telegramIdValue, businessIdValue)
                    .orElseGet(() -> createNewUser(socialUserInfo, userTypeEnum, businessIdValue));
        }

        return userRepository.findByTelegramIdAndIsDeletedFalse(telegramIdValue)
                .orElseGet(() -> createNewUser(socialUserInfo, userTypeEnum, null));
    }

    private User createNewUser(SocialUserInfo socialUserInfo, UserType userTypeEnum, UUID businessIdValue) {
        if (userTypeEnum == UserType.BUSINESS_USER) {
            log.warn("Social auth user creation failed - BUSINESS_USER cannot be created via social auth");
            throw new ValidationException("Business users must be created through the proper business owner registration process");
        }

        String generatedUserIdentifier = generateUserIdentifier(socialUserInfo, userTypeEnum, businessIdValue);

        String defaultRoleName = switch (userTypeEnum) {
            case PLATFORM_USER -> "PLATFORM_OWNER";
            case BUSINESS_USER -> "BUSINESS_OWNER";
            case CUSTOMER -> "CUSTOMER";
        };

        Role defaultRoleEntity;
        if (userTypeEnum == UserType.CUSTOMER) {
            defaultRoleEntity = getOrCreateCustomerRole(businessIdValue);
        } else {
            List<Role> defaultRoles = roleRepository.findSystemRolesByName(defaultRoleName);
            if (defaultRoles.isEmpty()) {
                log.warn("User creation failed - default role not found: role_name={}, user_type={}", defaultRoleName, userTypeEnum);
                throw new ValidationException("Default role not found: " + defaultRoleName);
            }
            defaultRoleEntity = defaultRoles.get(0);
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

    private String generateUserIdentifier(SocialUserInfo socialUserInfo, UserType userTypeEnum, UUID businessIdValue) {
        String baseIdentifier = socialUserInfo.getUsername() != null ? socialUserInfo.getUsername() :
                      socialUserInfo.getEmail() != null ? socialUserInfo.getEmail().split("@")[0] :
                      "user" + socialUserInfo.getId().substring(0, 8);
        String normalizedIdentifier = baseIdentifier.toLowerCase().replaceAll("[^a-z0-9_]", "");
        int suffixCounter = 1;
        String candidateIdentifier = normalizedIdentifier;
        while (identifierExists(candidateIdentifier, userTypeEnum, businessIdValue)) {
            candidateIdentifier = normalizedIdentifier + suffixCounter++;
        }
        return candidateIdentifier;
    }

    private boolean identifierExists(String identifier, UserType userTypeEnum, UUID businessIdValue) {
        if (userTypeEnum == UserType.PLATFORM_USER) {
            return userRepository.existsByUserIdentifierAndUserTypeAndIsDeletedFalse(identifier, userTypeEnum);
        }
        if (businessIdValue != null) {
            return userRepository.existsByUserIdentifierAndBusinessIdAndIsDeletedFalse(identifier, businessIdValue);
        }
        return userRepository.existsByUserIdentifierAndUserTypeAndIsDeletedFalse(identifier, userTypeEnum);
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
