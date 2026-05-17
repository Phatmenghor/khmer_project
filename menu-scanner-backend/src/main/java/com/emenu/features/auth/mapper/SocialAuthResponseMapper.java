package com.emenu.features.auth.mapper;

import com.emenu.enums.social.SocialAuthProvider;
import com.emenu.features.auth.dto.response.SocialAuthResponse;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.service.social.provider.SocialUserInfo;
import org.mapstruct.*;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface SocialAuthResponseMapper {

    @Mapping(target = "success", constant = "true")
    @Mapping(target = "message", constant = "Authentication successful")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userIdentifier", source = "user.userIdentifier")
    @Mapping(target = "userType", expression = "java(user.getUserType().name())")
    @Mapping(target = "accessToken", source = "accessToken")
    @Mapping(target = "refreshToken", source = "refreshToken")
    @Mapping(target = "provider", source = "provider")
    @Mapping(target = "socialId", source = "userInfo.id")
    @Mapping(target = "socialUsername", source = "userInfo.username")
    @Mapping(target = "syncedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "operationType", expression = "java(determineOperation(user))")
    @Mapping(target = "isNewUser", expression = "java(isNewUser(user))")
    SocialAuthResponse toResponse(User user, String accessToken, String refreshToken,
                                   SocialAuthProvider provider, SocialUserInfo userInfo);

    default String determineOperation(User user) {
        return user.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(5)) ? "register" : "login";
    }

    default boolean isNewUser(User user) {
        return user.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(5));
    }
}
