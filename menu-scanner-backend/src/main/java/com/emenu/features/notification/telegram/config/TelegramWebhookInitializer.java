package com.emenu.features.notification.telegram.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramWebhookInitializer implements ApplicationRunner {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.enabled:true}")
    private boolean telegramEnabled;

    @Value("${telegram.bot.auto-setup:false}")
    private boolean autoSetup;

    @Value("${telegram.bot.webhook-url:}")
    private String webhookUrl;

    private final RestTemplate restTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!telegramEnabled) {
            log.info("[Telegram] Bot is disabled, skipping webhook initialization");
            return;
        }

        if (!autoSetup) {
            log.info("[Telegram] Auto-setup is disabled, skipping webhook initialization");
            return;
        }

        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.info("[Telegram] No webhook URL configured, skipping auto-setup");
            log.info("[Telegram] To enable auto-setup, set TELEGRAM_WEBHOOK_URL environment variable");
            return;
        }

        setupWebhook();
    }

    private void setupWebhook() {
        try {
            log.info("[Telegram] Setting up webhook with URL: {}", webhookUrl);

            String apiUrl = String.format("https://api.telegram.org/bot%s/setWebhook", botToken);

            Map<String, Object> body = new HashMap<>();
            body.put("url", webhookUrl);

            String response = restTemplate.postForObject(apiUrl, body, String.class);

            log.info("[Telegram] Webhook setup response: {}", response);

            if (response != null && response.contains("true")) {
                log.info("[Telegram] Webhook successfully configured: {}", webhookUrl);
            } else {
                log.warn("[Telegram] Webhook setup returned unexpected response: {}", response);
            }
        } catch (Exception e) {
            log.warn("[Telegram] Failed to setup webhook: {} — Please manually configure the webhook if needed or check your connection/credentials.", e.getMessage());
        }
    }
}
