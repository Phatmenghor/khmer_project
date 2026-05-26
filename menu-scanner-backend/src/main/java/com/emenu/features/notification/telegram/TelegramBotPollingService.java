package com.emenu.features.notification.telegram;

import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class TelegramBotPollingService {

    private static final String API = "https://api.telegram.org/bot%s/%s";
    private static final long MAX_BACKOFF_MS = 300_000L; // 5 minutes
    private static final int LOG_SUPPRESS_AFTER = 5;

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.enabled:true}")
    private boolean enabled;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final TelegramNotificationService telegramNotificationService;

    private final AtomicLong offset = new AtomicLong(0);
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private volatile long backoffUntil = 0;

    public TelegramBotPollingService(
            @Qualifier("telegramRestTemplate") RestTemplate restTemplate,
            ObjectMapper objectMapper,
            TelegramNotificationService telegramNotificationService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.telegramNotificationService = telegramNotificationService;
    }

    @Scheduled(fixedDelay = 3000)
    public void pollUpdates() {
        if (!enabled) return;
        if (System.currentTimeMillis() < backoffUntil) return;

        try {
            String url = String.format(API, botToken, "getUpdates") +
                         "?offset=" + offset.get() + "&timeout=1";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) return;

            JsonNode root = objectMapper.readTree(response.getBody());
            if (!root.path("ok").asBoolean()) return;

            int prevFailures = consecutiveFailures.getAndSet(0);
            if (prevFailures > 0) {
                log.info("[TelegramBot] Connection restored after {} failed attempt(s).", prevFailures);
            }

            for (JsonNode update : root.path("result")) {
                long updateId = update.path("update_id").asLong();
                offset.set(updateId + 1);

                JsonNode message = update.path("message");
                if (message.isMissingNode()) continue;

                String text   = message.path("text").asText("").trim();
                long   chatId = message.path("chat").path("id").asLong();
                String type   = message.path("chat").path("type").asText();
                String title  = message.path("chat").path("title").asText("this chat");

                if (text.startsWith("/chatid")) {
                    handleChatId(chatId, type, title);
                } else if (text.startsWith("/link")) {
                    handleLink(chatId, type, text);
                }
            }
        } catch (Exception e) {
            int failures = consecutiveFailures.incrementAndGet();
            long backoffMs = Math.min(3000L * (1L << Math.min(failures, 7)), MAX_BACKOFF_MS);
            backoffUntil = System.currentTimeMillis() + backoffMs;

            if (failures <= LOG_SUPPRESS_AFTER) {
                log.warn("[TelegramBot] Poll error #{} (retry in {}s): {}",
                        failures, backoffMs / 1000, e.getMessage());
            } else if (failures == LOG_SUPPRESS_AFTER + 1) {
                log.warn("[TelegramBot] Telegram API unreachable after {} attempts. " +
                         "Suppressing further warnings. Retrying with {}s backoff.",
                        failures, MAX_BACKOFF_MS / 1000);
            }
        }
    }

    private void handleChatId(long chatId, String type, String title) {
        if ("private".equals(type)) {
            sendReply(chatId, "This is a private chat. Add me to a group first, then use /chatid there.");
            return;
        }
        sendReply(chatId,
            "<b>Chat ID for " + escapeHtml(title) + "</b>\n\n" +
            "<code>" + chatId + "</code>\n\n" +
            "To link this group to your business, type:\n" +
            "<code>/link YOUR_BUSINESS_ID</code>\n\n" +
            "Find your Business ID in Business Settings - Telegram Monitoring.");
    }

    private void handleLink(long chatId, String type, String text) {
        if ("private".equals(type)) {
            sendReply(chatId, "Please add me to a group first, then use /link there.");
            return;
        }

        String[] parts = text.split("\\s+", 2);
        if (parts.length < 2 || parts[1].isBlank()) {
            sendReply(chatId,
                "Please include your Business ID:\n" +
                "<code>/link YOUR_BUSINESS_ID</code>\n\n" +
                "Find your Business ID in Business Settings - Telegram Monitoring.");
            return;
        }

        UUID businessId;
        try {
            businessId = UUID.fromString(parts[1].trim());
        } catch (IllegalArgumentException e) {
            sendReply(chatId, "Invalid Business ID format. Please copy it exactly from Business Settings.");
            return;
        }

        String businessName = telegramNotificationService.linkGroupToBusinessId(businessId, chatId);
        if (businessName == null) {
            sendReply(chatId, "Business not found. Please check your Business ID and try again.");
            return;
        }

        telegramNotificationService.notifyGroupLinked(chatId, businessName);
        log.info("[TelegramBot] Group {} linked to business {}", chatId, businessId);
    }

    private void sendReply(long chatId, String html) {
        try {
            String url = String.format(API, botToken, "sendMessage");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", html);
            body.put("parse_mode", "HTML");
            restTemplate.postForObject(url, new HttpEntity<>(body, headers), String.class);
        } catch (Exception e) {
            log.warn("[TelegramBot] Reply error: {}", e.getMessage());
        }
    }

    private String escapeHtml(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
