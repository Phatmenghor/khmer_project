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
import org.springframework.beans.factory.annotation.Autowired;
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
            log.debug("Could not extract userType from token: {}", e.getMessage());
            return null;
        }
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ValidationException("User not authenticated");
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
            throw new ValidationException(AuthStatusMessages.ACCOUNT_LOCKED);
        }

        if (user.getAccountStatus() == AccountStatus.END_WORK) {
            throw new ValidationException(AuthStatusMessages.ACCOUNT_ENDED);
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

            String userIdentifier = authentication.getName();
            String userTypeStr = extractUserTypeFromToken();

            Optional<User> userOpt;
            if (userTypeStr != null) {
                try {
                    UserType userType = UserType.valueOf(userTypeStr);
                    userOpt = userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userType);
                } catch (IllegalArgumentException e) {
                    log.debug("Invalid userType from token: {}", userTypeStr);
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
            log.debug("Error getting current user (public access mode): {}", e.getMessage());
            return Optional.empty();
        }
    }

    public UUID getCurrentUserBusinessId() {
        try {
            User currentUser = getCurrentUser();
            return currentUser.getBusinessId();
        } catch (Exception e) {
            log.debug("Error getting business ID: {}", e.getMessage());
            return null;
        }
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public com.emenu.enums.user.UserType getCurrentUserType() {
        try {
            User currentUser = getCurrentUser();
            return currentUser.getUserType();
        } catch (Exception e) {
            log.debug("Error getting user type: {}", e.getMessage());
            return null;
        }
    }
}
