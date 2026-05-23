package com.emenu.features.auth.mapper;

import com.emenu.enums.social.SocialAuthProvider;
import com.emenu.features.auth.dto.response.SocialSyncResponse;
import com.emenu.features.auth.models.User;
import org.mapstruct.*;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface SocialSyncResponseMapper {

    @Mapping(target = "success", constant = "true")
    @Mapping(target = "message", expression = "java(provider.getDisplayName() + \" account synced successfully\")")
    @Mapping(target = "provider", source = "provider.providerKey")
    @Mapping(target = "syncedAt", expression = "java(getTelegramSyncedAt(user))")
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

    default LocalDateTime getTelegramSyncedAt(User user) {
        return user.getTelegram() != null ? user.getTelegram().getTelegramSyncedAt() : null;
    }

    @Mapping(target = "success", constant = "true")
    @Mapping(target = "message", expression = "java(provider.getDisplayName() + \" account unsynced successfully\")")
    @Mapping(target = "provider", source = "provider.providerKey")
    @Mapping(target = "syncedAt", ignore = true)
    @Mapping(target = "telegramId", ignore = true)
    @Mapping(target = "telegramUsername", ignore = true)
    @Mapping(target = "telegramFirstName", ignore = true)
    @Mapping(target = "telegramLastName", ignore = true)
    @Mapping(target = "telegramPhotoUrl", ignore = true)
    SocialSyncResponse toUnsyncResponse(SocialAuthProvider provider);
}
