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

        String md5 = response.getData().getMd5();
        log.info("Sending Telegram QR notification for md5={}", md5);

        String message = """
                <b>BAKONG KHQR GENERATED</b>

                • <b>Merchant:</b> %s
                • <b>Amount:</b> %s %s
                • <b>MD5 Code:</b> <code>%s</code>
                • <b>Request URL:</b> <code>%s</code>
                """.formatted(
                escapeHtml(request.merchantName()),
                request.amount(),
                request.currency(),
                escapeHtml(md5),
                escapeHtml(requestUrl)
        );

        sendMessage(message);
    }

    @Override
    public void notifyTransactionChecked(String requestUrl, String upstreamUrl, CheckTransactionRequest request, BakongResponse response) {
        log.info("Sending Telegram transaction notification for md5={}", request.md5());

        String statusLabel = response.isSuccess() ? "SUCCESS" : ("CODE " + response.responseCode());
        String message = """
                <b>BAKONG TRANSACTION CHECKED</b>

                • <b>MD5 Code:</b> <code>%s</code>
                • <b>Status:</b> %s
                • <b>Response Message:</b> %s
                • <b>Request URL:</b> <code>%s</code>
                • <b>Upstream URL:</b> <code>%s</code>
                """.formatted(
                escapeHtml(request.md5()),
                escapeHtml(statusLabel),
                escapeHtml(response.responseMessage()),
                escapeHtml(requestUrl),
                escapeHtml(upstreamUrl)
        );

        sendMessage(message);
    }

    @Override
    public void notifyIssue(String title, String requestUrl, Object requestPayload, Throwable throwable) {
        log.warn("Sending Telegram issue notification title={} requestUrl={}", title, requestUrl);

        String message = """
                <b>BAKONG GATEWAY ISSUE</b>

                • <b>Title:</b> %s
                • <b>Request URL:</b> <code>%s</code>
                • <b>Error Details:</b> <code>%s</code>
                """.formatted(
                escapeHtml(title),
                escapeHtml(requestUrl),
                escapeHtml(toThrowableMessage(throwable))
        );

        sendMessage(message);
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
                            "text", TextUtils.abbreviate(message, 3500),
                            "parse_mode", "HTML"
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

    private static String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
