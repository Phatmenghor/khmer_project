package com.emenu.features.notification.telegram.mapper;

import com.emenu.features.notification.telegram.dto.response.TelegramStatusResponse;
import org.springframework.stereotype.Component;

@Component
public class TelegramNotificationMapper {

    public TelegramStatusResponse toStatusResponse(String chatId) {
        boolean linked = chatId != null && !chatId.isBlank();
        return TelegramStatusResponse.builder()
                .linked(linked)
                .chatId(linked ? chatId : null)
                .build();
    }
}
