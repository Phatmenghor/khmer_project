package com.emenu.features.bakong.common;

import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramNotifierImpl implements TelegramNotifier {

    private final TelegramProperties telegramProperties;
    private final TelegramClientComponent telegramClientComponent;

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
            log.error("Failed to process async Telegram QR notification: {}", ex.getMessage(), ex);
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyTransactionChecked(String requestUrl, String upstreamUrl, CheckTransactionRequest request, BakongResponse response) {
        try {
            log.info("Sending Telegram transaction notification for md5={}", request.getMd5());

            String statusLabel = response.isSuccess() ? "SUCCESS" : ("CODE " + response.getResponseCode());
            String statusEmoji = response.isSuccess() ? "✅" : "⚠️";

            String message = TelegramMessageComposer.create()
                    .header("💳", "BAKONG TRANSACTION CHECKED")
                    .codeField("MD5 Code", request.getMd5())
                    .statusField("Status", statusEmoji, statusLabel)
                    .field("Response Message", response.getResponseMessage())
                    .codeField("Request URL", requestUrl)
                    .codeField("Upstream URL", upstreamUrl)
                    .build();

            telegramClientComponent.sendMessage(message);
        } catch (Exception ex) {
            log.error("Failed to process async Telegram transaction notification: {}", ex.getMessage(), ex);
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyIssue(String title, String requestUrl, Object requestPayload, Throwable throwable) {
        try {
            log.warn("Sending Telegram issue notification title={} requestUrl={}", title, requestUrl);

            String message = TelegramMessageComposer.create()
                    .header("⚠️", "BAKONG GATEWAY ISSUE")
                    .field("Title", title)
                    .codeField("Request URL", requestUrl)
                    .codeField("Error Details", toThrowableMessage(throwable))
                    .build();

            telegramClientComponent.sendMessage(message);
        } catch (Exception ex) {
            log.error("Failed to process async Telegram issue notification: {}", ex.getMessage(), ex);
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
