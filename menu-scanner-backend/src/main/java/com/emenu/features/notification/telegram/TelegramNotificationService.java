package com.emenu.features.notification.telegram;

import java.util.UUID;

public interface TelegramNotificationService {

    void sendToGroup(UUID businessId, String message);

    void sendHtmlToGroup(UUID businessId, String htmlMessage);

    /**
     * Persist the given Telegram group chat ID to the business settings for the specified business.
     * Returns the business name on success, null if the business was not found.
     */
    String linkGroupToBusinessId(UUID businessId, long chatId);
}
