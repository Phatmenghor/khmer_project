package com.emenu.features.bakong.integration.telegram;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.util.TextUtils;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramNotifierImpl implements TelegramNotifier {

    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${telegram.bot.enabled}")
    private boolean enabled;

    @Value("${telegram.bot.token}")
    private String token;

    @Value("${telegram.bot.group-chat-id}")
    private String groupChatId;

    @Value("${telegram.bot.webhook-url:}")
    private String webhookUrl;

    @Value("${telegram.bot.auto-setup}")
    private boolean autoSetup;

    @PostConstruct
    void logTelegramConfiguration() {
        log.info(
                "Telegram notifier enabled={}, autoSetup={}, tokenConfigured={}, chatIdConfigured={}",
                enabled,
                autoSetup,
                hasText(token),
                hasText(groupChatId)
        );

        validateTelegramChatAccess();
    }

    @Override
    public void notifyQrGenerated(String requestUrl, BakongRequest request, KHQRResponse<KHQRData> response) {
        if (response == null || response.getData() == null) {
            log.warn("Skipping Telegram QR notification because response data is missing");
            return;
        }

        log.info("Sending Telegram QR notification for md5={}", response.getData().getMd5());
        sendMessage(
                """
                ✅ Bakong QR Generated
                🌐 Request URL: %s
                📦 Request: %s
                🧾 MD5: %s
                💵 Amount: %s %s
                🏪 Merchant: %s
                """.formatted(
                        requestUrl,
                        toPayload(request),
                        response.getData().getMd5(),
                        request.amount(),
                        request.currency(),
                        request.merchantName()
                )
        );
    }

    @Override
    public void notifyTransactionChecked(String requestUrl, String upstreamUrl, CheckTransactionRequest request, BakongResponse response) {
        log.info("Sending Telegram transaction notification for md5={}", request.md5());
        sendMessage(
                """
                🔍 Bakong Transaction Checked
                🌐 Request URL: %s
                🔗 Upstream URL: %s
                📦 Request: %s
                🧾 MD5: %s
                📨 Response Code: %s
                💬 Message: %s
                """.formatted(
                        requestUrl,
                        upstreamUrl,
                        toPayload(request),
                        request.md5(),
                        response.responseCode(),
                        response.responseMessage()
                )
        );
    }

    @Override
    public void notifyIssue(String title, String requestUrl, Object requestPayload, Throwable throwable) {
        log.warn("Sending Telegram issue notification title={} requestUrl={}", title, requestUrl);
        sendMessage(
                """
                🚨 %s
                🌐 Request URL: %s
                📦 Request: %s
                ❗ Error: %s
                """.formatted(
                        title,
                        requestUrl,
                        toPayload(requestPayload),
                        toThrowableMessage(throwable)
                )
        );
    }

    private void sendMessage(String message) {
        if (!enabled) {
            return;
        }

        if (!hasText(token) || !hasText(groupChatId)) {
            log.warn("Telegram notification is enabled but bot token or group chat id is missing");
            return;
        }

        try {
            restClient.post()
                    .uri("https://api.telegram.org/bot{token}/sendMessage", token)
                    .body(Map.of(
                            "chat_id", groupChatId,
                            "text", TextUtils.abbreviate(message, 3500)
                    ))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Telegram notification sent successfully to group ChatId={}", groupChatId);
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

    private void validateTelegramChatAccess() {
        if (!enabled || !autoSetup) {
            return;
        }

        if (!hasText(token) || !hasText(groupChatId)) {
            log.warn("Skipping Telegram startup validation because bot token or group chat id is missing");
            return;
        }

        try {
            log.info("Validating Telegram group chat access for chatId={}", groupChatId);
            restClient.get()
                    .uri(
                            "https://api.telegram.org/bot{token}/getChat?chat_id={chatId}",
                            token,
                            groupChatId
                    )
                    .retrieve()
                    .toBodilessEntity();
            log.info("Telegram group chat validation succeeded for chatId={}", groupChatId);
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

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String toPayload(Object payload) {
        try {
            return TextUtils.abbreviate(objectMapper.writeValueAsString(payload), 1200);
        } catch (Exception ex) {
            return TextUtils.abbreviate(String.valueOf(payload), 1200);
        }
    }

    private String toThrowableMessage(Throwable throwable) {
        if (throwable == null) {
            return "Unknown error";
        }

        String message = throwable.getMessage();
        if (message == null || message.isBlank()) {
            message = throwable.getClass().getSimpleName();
        }

        return TextUtils.abbreviate(message, 1200);
    }
}
