package com.emenu.features.bakong.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Component
@Slf4j
public class TelegramClientComponent {

    private final TelegramProperties telegramProperties;
    private final RestClient restClient;

    public TelegramClientComponent(TelegramProperties telegramProperties) {
        this.telegramProperties = telegramProperties;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000); // 3s Connect Timeout
        factory.setReadTimeout(3000);    // 3s Read Timeout

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

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
            if (ex.getStatusCode().value() == 429) {
                log.warn("Telegram rate limit reached (HTTP 429 Too Many Requests). Skipping startup check: {}", ex.getResponseBodyAsString());
            } else {
                log.error("Telegram group chat validation status={} responseBody={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            }
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
            if (ex.getStatusCode().value() == 429) {
                log.warn("Telegram notification rate limit reached (HTTP 429 Too Many Requests). Skipping message.");
            } else {
                log.warn("Failed to send Telegram notification status={} message={}", ex.getStatusCode(), ex.getMessage());
            }
        } catch (Exception ex) {
            log.warn("Telegram notification skipped: {}", ex.getMessage());
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
