package com.emenu.features.auth.service;

import com.emenu.enums.user.UserType;
import com.emenu.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserValidationService {

    private final UserRepository userRepository;

    public boolean isUsernameAvailable(String userIdentifier, UserType userType, UUID businessId) {

        switch (userType) {
            case PLATFORM_USER:
            case CUSTOMER:
                // For platform users and customers, check global uniqueness within their user type
                boolean existsByType = userRepository.existsByUserIdentifierAndUserTypeAndIsDeletedFalse(userIdentifier, userType);
                return !existsByType;

            case BUSINESS_USER:
                // For business users, check uniqueness within the specific business
                if (businessId == null) {
                    throw new IllegalArgumentException("Business ID is required for BUSINESS_USER type");
                }
                boolean existsInBusiness = userRepository.existsByUserIdentifierAndBusinessIdAndIsDeletedFalse(userIdentifier, businessId);
                return !existsInBusiness;

            default:
                throw new IllegalArgumentException("Unknown user type: " + userType);
        }
    }

    public void validateUsernameUniqueness(String userIdentifier, UserType userType, UUID businessId) {
        if (!isUsernameAvailable(userIdentifier, userType, businessId)) {
            String context = userType == UserType.BUSINESS_USER
                    ? " in this business"
                    : " for " + userType.name().toLowerCase().replace("_", " ");
            throw new com.emenu.exception.custom.ValidationException(
                    "Username '" + userIdentifier + "' is already taken" + context
            );
        }
    }
}
