package com.emenu.features.telegram.service.impl;

import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.config.TelegramProperties;
import com.emenu.features.telegram.dto.TelegramCustomMessageRequest;
import com.emenu.features.telegram.dto.TelegramNotificationResponse;
import com.emenu.features.telegram.service.TelegramService;
import com.emenu.features.telegram.util.TelegramClientComponent;
import com.emenu.features.telegram.util.TelegramMessageComposer;
import com.emenu.util.TextUtils;
import jakarta.annotation.PostConstruct;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramServiceImpl implements TelegramService {

    private final TelegramProperties telegramProperties;
    private final TelegramClientComponent telegramClientComponent;

    private final Set<String> notifiedIssueTraceIds = ConcurrentHashMap.newKeySet();

    private boolean isAlreadyNotified(String traceId) {
        if (notifiedIssueTraceIds.size() > 500) {
            notifiedIssueTraceIds.clear();
        }
        return !notifiedIssueTraceIds.add(traceId);
    }

    @PostConstruct
    void logTelegramConfiguration() {
        log.info(
                "Telegram notifier enabled={}, autoSetup={}, tokenConfigured={}, chatIdConfigured={}",
                telegramProperties.isEnabled(),
                telegramProperties.isAutoSetup(),
                hasText(telegramProperties.getToken()),
                hasText(telegramProperties.getGroupChatId())
        );

        CompletableFuture.runAsync(telegramClientComponent::validateChatAccess);
    }

    @Override
    public TelegramNotificationResponse sendCustomNotification(TelegramCustomMessageRequest request) {
        String targetChatId = hasText(request.getChatId()) ? request.getChatId() : telegramProperties.getGroupChatId();

        TelegramMessageComposer composer = TelegramMessageComposer.create();
        if (hasText(request.getTitle())) {
            composer.header(request.getHeaderIcon(), request.getTitle());
        }

        if (hasText(request.getMessage())) {
            composer.raw(request.getMessage() + "\n");
        }

        if (request.getFields() != null) {
            request.getFields().forEach((k, v) -> {
                if (hasText(v)) composer.field(k, v);
            });
        }

        if (request.getCodeFields() != null) {
            request.getCodeFields().forEach((k, v) -> {
                if (hasText(v)) composer.codeField(k, v);
            });
        }

        String formattedText = composer.build();
        telegramClientComponent.sendMessageToChat(targetChatId, formattedText, request.getParseMode());

        return TelegramNotificationResponse.builder()
                .success(true)
                .message("Telegram message sent successfully")
                .targetChatId(targetChatId)
                .build();
    }

    @Override
    public void sendMessage(String message) {
        telegramClientComponent.sendMessage(message);
    }

    @Override
    public void sendMessageToChat(String chatId, String message, String parseMode) {
        telegramClientComponent.sendMessageToChat(chatId, message, parseMode);
    }

    @Override
    @Async("taskExecutor")
    public void notifyQrGenerated(String requestUrl, BakongRequest request, KHQRResponse<KHQRData> response) {
        try {
            if (response == null || response.getData() == null) {
                log.warn("Skipping Telegram QR notification because response data is missing");
                return;
            }

            String md5 = response.getData().getMd5();
            log.info("Sending Telegram QR notification for md5={}", md5);

            String message = TelegramMessageComposer.create()
                    .header("📌", "BAKONG KHQR GENERATED")
                    .field("Merchant", request.getMerchantName())
                    .field("Amount", request.getAmount() + " " + request.getCurrency())
                    .codeField("MD5 Code", md5)
                    .codeField("Request URL", requestUrl)
                    .build();

            telegramClientComponent.sendMessage(message);
        } catch (Exception ex) {
            log.warn("Failed to process async Telegram QR notification: {}", ex.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyTransactionChecked(String requestUrl, String upstreamUrl, CheckTransactionRequest request, BakongResponse response) {
        try {
            log.info("Sending Telegram transaction notification for transactionId={}", request != null ? request.getTransactionId() : null);

            String statusLabel = response != null && response.isSuccess() ? "SUCCESS" : ("CODE " + (response != null ? response.getResponseCode() : -1));

            String message = TelegramMessageComposer.create()
                    .header("💳", "BAKONG TRANSACTION CHECKED")
                    .codeField("Transaction ID", request != null ? request.getTransactionId() : null)
                    .statusField("Status", null, statusLabel)
                    .field("Response Message", response != null ? response.getResponseMessage() : null)
                    .codeField("Request URL", requestUrl)
                    .codeField("Upstream URL", upstreamUrl)
                    .build();

            telegramClientComponent.sendMessage(message);
        } catch (Exception ex) {
            log.warn("Failed to process async Telegram transaction notification: {}", ex.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyIssue(String title, String requestUrl, Object requestPayload, Throwable throwable) {
        try {
            String traceId = MDC.get("traceId");
            if (traceId != null && !traceId.isBlank() && !"none".equalsIgnoreCase(traceId)) {
                if (isAlreadyNotified(traceId)) {
                    log.info("Skipping duplicate Telegram issue notification for traceId={}", traceId);
                    return;
                }
            }

            log.warn("Sending Telegram issue notification title={} requestUrl={}", title, requestUrl);

            String message = TelegramMessageComposer.create()
                    .header("⚠️", "GATEWAY ISSUE")
                    .field("Title", title)
                    .codeField("Request URL", requestUrl)
                    .codeField("Error Details", toThrowableMessage(throwable))
                    .build();

            telegramClientComponent.sendMessage(message);
        } catch (Exception ex) {
            log.warn("Failed to process async Telegram issue notification: {}", ex.getMessage());
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
}
