package com.emenu.features.notification.telegram;

import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramNotificationServiceImpl implements TelegramNotificationService {

    private static final String TELEGRAM_API = "https://api.telegram.org/bot%s/sendMessage";

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.enabled:true}")
    private boolean enabled;

    private final BusinessSettingRepository businessSettingRepository;
    private final RestTemplate restTemplate;

    @Override
    public void sendToGroup(UUID businessId, String message) {
        send(businessId, message, "MarkdownV2");
    }

    @Override
    public void sendHtmlToGroup(UUID businessId, String htmlMessage) {
        send(businessId, htmlMessage, "HTML");
    }

    private void send(UUID businessId, String text, String parseMode) {
        if (!enabled) return;

        String chatId = resolveChatId(businessId);
        if (chatId == null || chatId.isBlank()) {
            log.debug("[Telegram] No group chat ID configured for business={}", businessId);
            return;
        }

        try {
            String url = String.format(TELEGRAM_API, botToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", text);
            body.put("parse_mode", parseMode);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForObject(url, request, String.class);

            log.debug("[Telegram] Message sent to group {} for business={}", chatId, businessId);
        } catch (Exception e) {
            log.warn("[Telegram] Failed to send message to group for business={}: {}", businessId, e.getMessage());
        }
    }

    private String resolveChatId(UUID businessId) {
        return businessSettingRepository
            .findByBusinessIdAndIsDeletedFalse(businessId)
            .map(BusinessSetting::getTelegramGroupChatId)
            .orElse(null);
    }
}
