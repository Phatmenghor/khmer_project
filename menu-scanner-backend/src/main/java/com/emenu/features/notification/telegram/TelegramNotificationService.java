package com.emenu.features.notification.telegram;

import java.util.UUID;

public interface TelegramNotificationService {

    /**
     * Send a plain-text message to the business's configured Telegram monitoring group.
     * Does nothing if the business has no group chat ID configured.
     */
    void sendToGroup(UUID businessId, String message);

    /**
     * Send an HTML-formatted message to the business's configured Telegram monitoring group.
     * Does nothing if the business has no group chat ID configured.
     */
    void sendHtmlToGroup(UUID businessId, String htmlMessage);
}
