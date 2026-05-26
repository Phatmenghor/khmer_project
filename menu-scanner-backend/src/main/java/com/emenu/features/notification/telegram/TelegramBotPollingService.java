package com.emenu.features.notification.telegram;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramBotPollingService {

    private static final String API = "https://api.telegram.org/bot%s/%s";

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.enabled:true}")
    private boolean enabled;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private final AtomicLong offset = new AtomicLong(0);

    @Scheduled(fixedDelay = 3000)
    public void pollUpdates() {
        if (!enabled) return;
        try {
            String url = String.format(API, botToken, "getUpdates") +
                         "?offset=" + offset.get() + "&timeout=1";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) return;

            JsonNode root = objectMapper.readTree(response.getBody());
            if (!root.path("ok").asBoolean()) return;

            for (JsonNode update : root.path("result")) {
                long updateId = update.path("update_id").asLong();
                offset.set(updateId + 1);

                JsonNode message = update.path("message");
                if (message.isMissingNode()) continue;

                String text = message.path("text").asText("");
                if (!text.startsWith("/chatid")) continue;

                long chatId   = message.path("chat").path("id").asLong();
                String type   = message.path("chat").path("type").asText();
                String title  = message.path("chat").path("title").asText("this chat");

                String reply;
                if ("private".equals(type)) {
                    reply = "This is a private chat. Please add me to a group first, then type /chatid there.";
                } else {
                    reply = "📋 Group Chat ID for <b>" + escapeHtml(title) + "</b>\n\n" +
                            "<code>" + chatId + "</code>\n\n" +
                            "Copy this ID and paste it into Business Settings → Telegram Monitoring.";
                }

                sendReply(chatId, reply);
            }
        } catch (Exception e) {
            log.debug("[TelegramBot] Poll error: {}", e.getMessage());
        }
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
            log.debug("[TelegramBot] Reply error: {}", e.getMessage());
        }
    }

    private String escapeHtml(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
