package com.emenu.features.bakong.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramClientComponent {

    private final TelegramProperties telegramProperties;
    private final RestClient restClient;

    public void validateChatAccess() {
        if (!telegramProperties.isEnabled() || !telegramProperties.isAutoSetup()) {
            return;
        }

        if (!hasText(telegramProperties.getToken()) || !hasText(telegramProperties.getGroupChatId())) {
            log.warn("Skipping Telegram startup validation because bot token or group chat id is missing");
            return;
        }

        try {
            log.info("Validating Telegram group chat access for chatId={}", telegramProperties.getGroupChatId());
            restClient.get()
                    .uri(
                            telegramProperties.getGetChatUrl(),
                            telegramProperties.getToken(),
                            telegramProperties.getGroupChatId()
                    )
                    .retrieve()
                    .toBodilessEntity();
            log.info("Telegram group chat validation succeeded for chatId={}", telegramProperties.getGroupChatId());
        } catch (RestClientResponseException ex) {
            log.error(
                    "Telegram group chat validation status={} responseBody={}",
                    ex.getStatusCode(),
                    ex.getResponseBodyAsString()
            );
        } catch (Exception ex) {
            log.error("Telegram group chat validation failed: {}", ex.getMessage());
        }
    }

    public void sendMessage(String message) {
        if (!telegramProperties.isEnabled()) {
            return;
        }

        if (!hasText(telegramProperties.getToken()) || !hasText(telegramProperties.getGroupChatId())) {
            log.warn("Telegram notification is enabled but bot token or group chat id is missing");
            return;
        }

        try {
            restClient.post()
                    .uri(telegramProperties.getSendMessageUrl(), telegramProperties.getToken())
                    .body(Map.of(
                            "chat_id", telegramProperties.getGroupChatId(),
                            "text", TextUtils.abbreviate(message, 3500),
                            "parse_mode", "HTML"
                    ))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Telegram notification sent successfully to group ChatId={}", telegramProperties.getGroupChatId());
        } catch (RestClientResponseException ex) {
            log.error(
                    "Failed to send Telegram notification status={} responseBody={}",
                    ex.getStatusCode(),
                    ex.getResponseBodyAsString(),
                    ex
            );
        } catch (Exception ex) {
            log.error("Failed to send Telegram notification: {}", ex.getMessage());
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
