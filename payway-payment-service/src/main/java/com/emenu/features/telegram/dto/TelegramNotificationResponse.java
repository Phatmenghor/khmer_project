package com.emenu.features.telegram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramNotificationResponse {

    private boolean success;
    private String message;
    private String targetChatId;
}
