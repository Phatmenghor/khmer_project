package com.emenu.features.telegram.util;

import com.emenu.config.TelegramProperties;
import com.emenu.constant.TelegramApiConstants;
import com.emenu.util.TextUtils;
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
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(7000);

        String baseUrl = TextUtils.hasText(telegramProperties.getApiUrl())
                ? telegramProperties.getApiUrl()
                : TelegramApiConstants.DEFAULT_TELEGRAM_API_URL;

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    public void validateChatAccess() {
        if (!telegramProperties.isEnabled() || !hasValidCredentials()) {
            log.info("Telegram notification service is disabled or unconfigured.");
            return;
        }

        try {
            String path = TextUtils.hasText(telegramProperties.getGetChatUrl())
                    ? telegramProperties.getGetChatUrl()
                    : TelegramApiConstants.GET_CHAT_PATH;

            log.info("Validating Telegram Bot access to groupChatId={}", telegramProperties.getGroupChatId());

            this.restClient.post()
                    .uri(path, telegramProperties.getToken())
                    .body(Map.of("chat_id", telegramProperties.getGroupChatId()))
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully verified Telegram Bot integration.");
        } catch (RestClientResponseException ex) {
            log.warn("Failed Telegram bot access check: HTTP {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.warn("Telegram bot access check error: {}", ex.getMessage());
        }
    }

    public void sendMessage(String message) {
        if (!telegramProperties.isEnabled() || !hasValidCredentials()) {
            log.debug("Telegram is disabled/unconfigured. Skipping message dispatch.");
            return;
        }
        sendMessageToChat(telegramProperties.getGroupChatId(), message, "HTML");
    }

    public void sendMessageToChat(String chatId, String message, String parseMode) {
        if (!telegramProperties.isEnabled() || !TextUtils.hasText(telegramProperties.getToken())) {
            log.warn("Cannot send Telegram message: Bot token is missing or Telegram feature is disabled.");
            return;
        }

        if (!TextUtils.hasText(chatId)) {
            log.warn("Cannot send Telegram message: Target chatId is empty.");
            return;
        }

        try {
            String path = TextUtils.hasText(telegramProperties.getSendMessageUrl())
                    ? telegramProperties.getSendMessageUrl()
                    : TelegramApiConstants.SEND_MESSAGE_PATH;

            String mode = TextUtils.hasText(parseMode) ? parseMode : "HTML";

            log.debug("Dispatching Telegram notification to chatId={}", chatId);

            this.restClient.post()
                    .uri(path, telegramProperties.getToken())
                    .body(Map.of(
                            "chat_id", chatId,
                            "text", message,
                            "parse_mode", mode
                    ))
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientResponseException ex) {
            log.error("Telegram API Error [HTTP {}]: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.error("Failed to send Telegram notification: {}", ex.getMessage());
        }
    }

    private boolean hasValidCredentials() {
        return TextUtils.hasText(telegramProperties.getToken()) && TextUtils.hasText(telegramProperties.getGroupChatId());
    }
}
