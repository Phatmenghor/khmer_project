package com.emenu.features.auth.mapper;

import com.emenu.enums.social.SocialAuthProvider;
import com.emenu.features.auth.dto.response.SocialSyncResponse;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.models.UserTelegram;
import org.mapstruct.*;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface SocialSyncResponseMapper {

    @Mapping(target = "success", constant = "true")
    @Mapping(target = "message", expression = "java(provider.getDisplayName() + \" account synced successfully\")")
    @Mapping(target = "provider", source = "provider.providerKey")
    @Mapping(target = "syncedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "telegramId", expression = "java(getTelegramId(user))")
    @Mapping(target = "telegramUsername", expression = "java(getTelegramUsername(user))")
    @Mapping(target = "telegramFirstName", expression = "java(getTelegramFirstName(user))")
    @Mapping(target = "telegramLastName", expression = "java(getTelegramLastName(user))")
    @Mapping(target = "telegramPhotoUrl", expression = "java(getTelegramPhotoUrl(user))")
    SocialSyncResponse toResponse(User user, SocialAuthProvider provider);

    default Long getTelegramId(User user) {
        return user.getTelegram() != null ? user.getTelegram().getTelegramId() : null;
    }

    default String getTelegramUsername(User user) {
        return user.getTelegram() != null ? user.getTelegram().getTelegramUsername() : null;
    }

    default String getTelegramFirstName(User user) {
        return user.getTelegram() != null ? user.getTelegram().getTelegramFirstName() : null;
    }

    default String getTelegramLastName(User user) {
        return user.getTelegram() != null ? user.getTelegram().getTelegramLastName() : null;
    }

    default String getTelegramPhotoUrl(User user) {
        return user.getTelegram() != null ? user.getTelegram().getTelegramPhotoUrl() : null;
    }

    @Mapping(target = "success", constant = "true")
    @Mapping(target = "message", expression = "java(provider.getDisplayName() + \" account unsynced successfully\")")
    @Mapping(target = "provider", source = "provider.providerKey")
    SocialSyncResponse toUnsyncResponse(SocialAuthProvider provider);
}
