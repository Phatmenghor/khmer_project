package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialSyncResponse {
    private boolean success;
    private String message;
    private String provider;
    private LocalDateTime syncedAt;

    private Long telegramId;
    private String telegramUsername;
    private String telegramFirstName;
    private String telegramLastName;
    private String telegramPhotoUrl;

    public static SocialSyncResponse telegramSuccess(Long telegramId, String telegramUsername,
            String telegramFirstName, String telegramLastName, String telegramPhotoUrl, LocalDateTime syncedAt) {
        return SocialSyncResponse.builder()
                .success(true).message("Telegram account synced successfully").provider("telegram")
                .telegramId(telegramId).telegramUsername(telegramUsername)
                .telegramFirstName(telegramFirstName).telegramLastName(telegramLastName)
                .telegramPhotoUrl(telegramPhotoUrl).syncedAt(syncedAt).build();
    }
}
