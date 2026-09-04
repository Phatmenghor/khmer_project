package com.emenu.security;

import com.emenu.enums.common.Status;
import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.*;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.security.jwt.JWTGenerator;
import com.emenu.shared.constants.AuthStatusMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityUtils {

    private final UserRepository userRepository;
    private final JWTGenerator jwtGenerator;

    private String extractUserTypeFromToken() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return null;
            }

            HttpServletRequest request = attributes.getRequest();
            String bearerToken = request.getHeader("Authorization");
            if (!StringUtils.hasText(bearerToken) || !bearerToken.startsWith("Bearer ")) {
                return null;
            }

            String token = bearerToken.substring(7);
            return jwtGenerator.getUserTypeFromJWT(token);
        } catch (Exception e) {
            log.warn("Could not extract userType from token: {}", e.getMessage());
            return null;
        }
    }

    private String extractUserIdFromToken() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return null;
            }

            HttpServletRequest request = attributes.getRequest();
            String bearerToken = request.getHeader("Authorization");
            if (!StringUtils.hasText(bearerToken) || !bearerToken.startsWith("Bearer ")) {
                return null;
            }

            String token = bearerToken.substring(7);
            return jwtGenerator.getUserIdFromJWT(token);
        } catch (Exception e) {
            log.warn("Could not extract userId from token: {}", e.getMessage());
            return null;
        }
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ValidationException("User not authenticated");
        }

        String userIdStr = extractUserIdFromToken();
        if (userIdStr != null) {
            try {
                UUID userId = UUID.fromString(userIdStr);
                return userRepository.findByIdAndIsDeletedFalse(userId)
                        .orElseThrow(() -> new ValidationException("User not found for ID: " + userId));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid userId from token: {}", userIdStr);
            }
        }

        String userIdentifier = authentication.getName();
        String userTypeStr = extractUserTypeFromToken();

        if (userTypeStr != null) {
            try {
                UserType userType = UserType.valueOf(userTypeStr);
                return userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userType)
                        .orElseThrow(() -> new ValidationException("User not found: " + userIdentifier));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid userType from token: {}", userTypeStr);
            }
        }

        return userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier)
                .orElseThrow(() -> new ValidationException("User not found"));
    }

    public String getCurrentUserIdentifier() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        return authentication.getName();
    }

    public void validateAccountStatus(User user) {
        if (user.getStatus() == Status.INACTIVE) {
            throw new ValidationException(AuthStatusMessages.ACCOUNT_INACTIVE);
        }

        if (user.getAccountStatus() == AccountStatus.LOCKED) {
            log.warn("Account locked: identifier={}", user.getUserIdentifier());
            throw new AccountLockedException(AuthStatusMessages.ACCOUNT_LOCKED);
        }

        if (user.getAccountStatus() == AccountStatus.END_WORK) {
            log.warn("Account end-work: identifier={}", user.getUserIdentifier());
            throw new AccountEndWorkException(AuthStatusMessages.ACCOUNT_ENDED);
        }
    }

    public boolean isCurrentUser(String userIdentifier) {
        String currentUserIdentifier = getCurrentUserIdentifier();
        return currentUserIdentifier != null && currentUserIdentifier.equals(userIdentifier);
    }

    public Optional<User> getCurrentUserOptional() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null ||
                    !authentication.isAuthenticated() ||
                    "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.empty();
            }

            String userIdStr = extractUserIdFromToken();
            if (userIdStr != null) {
                try {
                    UUID userId = UUID.fromString(userIdStr);
                    Optional<User> userOpt = userRepository.findByIdAndIsDeletedFalse(userId);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        try {
                            validateAccountStatus(user);
                            return Optional.of(user);
                        } catch (Exception e) {
                            log.warn("User account validation failed: ID={} - {}", userId, e.getMessage());
                            return Optional.empty();
                        }
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid userId from token: {}", userIdStr);
                }
            }

            String userIdentifier = authentication.getName();
            String userTypeStr = extractUserTypeFromToken();

            Optional<User> userOpt;
            if (userTypeStr != null) {
                try {
                    UserType userType = UserType.valueOf(userTypeStr);
                    userOpt = userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userType);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid userType from token: {}", userTypeStr);
                    userOpt = userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier);
                }
            } else {
                userOpt = userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier);
            }

            if (userOpt.isEmpty()) {
                log.warn("Authenticated user not found in database: {}", userIdentifier);
                return Optional.empty();
            }

            User user = userOpt.get();

            try {
                validateAccountStatus(user);
            } catch (Exception e) {
                log.warn("User account validation failed: {} - {}", userIdentifier, e.getMessage());
                return Optional.empty();
            }

            return Optional.of(user);

        } catch (Exception e) {
            log.warn("Error getting current user (public access mode): {}", e.getMessage());
            return Optional.empty();
        }
    }

    public UUID getCurrentUserBusinessId() {
        try {
            User currentUser = getCurrentUser();
            return currentUser.getBusinessId();
        } catch (Exception e) {
            log.warn("Error getting business ID: {}", e.getMessage());
            return null;
        }
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public UserType getCurrentUserType() {
        try {
            User currentUser = getCurrentUser();
            return currentUser.getUserType();
        } catch (Exception e) {
            log.warn("Error getting user type: {}", e.getMessage());
            return null;
        }
    }
}
