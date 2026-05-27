package com.emenu.features.notification.telegram.service.impl;

import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.notification.telegram.TelegramMessageBuilder;
import com.emenu.features.notification.telegram.dto.response.TelegramStatusResponse;
import com.emenu.features.notification.telegram.mapper.TelegramNotificationMapper;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.order.models.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class TelegramNotificationServiceImpl implements TelegramNotificationService {

    private static final String SEND_MESSAGE_URL = "https://api.telegram.org/bot%s/sendMessage";

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.enabled:true}")
    private boolean enabled;

    private final BusinessSettingRepository businessSettingRepository;
    private final TelegramNotificationMapper telegramNotificationMapper;
    private final RestTemplate restTemplate;

    public TelegramNotificationServiceImpl(
            BusinessSettingRepository businessSettingRepository,
            TelegramNotificationMapper telegramNotificationMapper,
            @Qualifier("telegramRestTemplate") RestTemplate restTemplate) {
        this.businessSettingRepository = businessSettingRepository;
        this.telegramNotificationMapper = telegramNotificationMapper;
        this.restTemplate = restTemplate;
    }

    // ── Status & management ───────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TelegramStatusResponse getStatus(UUID businessId) {
        String chatId = resolveChatId(businessId);
        return telegramNotificationMapper.toStatusResponse(chatId);
    }

    @Override
    @Async("taskExecutor")
    public void sendTestMessage(UUID businessId) {
        sendByBusinessId(businessId, TelegramMessageBuilder.testMessage(), "HTML");
    }

    // ── Low-level send ────────────────────────────────────────────────────────

    @Override
    public void sendToGroup(UUID businessId, String message) {
        sendByBusinessId(businessId, message, "MarkdownV2");
    }

    @Override
    public void sendHtmlToGroup(UUID businessId, String htmlMessage) {
        sendByBusinessId(businessId, htmlMessage, "HTML");
    }

    // ── Bot management ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public String linkGroupToBusinessId(UUID businessId, long chatId) {
        Optional<BusinessSetting> opt = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId);
        if (opt.isEmpty()) return null;

        BusinessSetting setting = opt.get();
        setting.setTelegramGroupChatId(String.valueOf(chatId));
        businessSettingRepository.save(setting);
        return setting.getBusiness() != null && setting.getBusiness().getName() != null
                ? setting.getBusiness().getName() : "your business";
    }

    // ── Order notifications ───────────────────────────────────────────────────

    @Override
    @Async("taskExecutor")
    public void notifyNewCustomerOrder(Order order) {
        sendByBusinessId(order.getBusinessId(), TelegramMessageBuilder.newCustomerOrder(order), "HTML");
    }

    @Override
    @Async("taskExecutor")
    public void notifyNewPOSOrder(Order order) {
        sendByBusinessId(order.getBusinessId(), TelegramMessageBuilder.newPOSOrder(order), "HTML");
    }

    @Override
    @Async("taskExecutor")
    public void notifyOrderStatusChanged(Order order) {
        sendByBusinessId(order.getBusinessId(), TelegramMessageBuilder.orderStatusChanged(order), "HTML");
    }

    // ── Staff notifications ───────────────────────────────────────────────────

    @Override
    @Async("taskExecutor")
    public void notifyNewStaff(UUID businessId, String name, String position,
                               String phone, String email, List<String> roles) {
        sendByBusinessId(businessId, TelegramMessageBuilder.newStaff(name, position, phone, email, roles), "HTML");
    }

    // ── Bot events ────────────────────────────────────────────────────────────

    @Override
    public void notifyGroupLinked(long chatId, String businessName) {
        sendToChatId(String.valueOf(chatId), TelegramMessageBuilder.groupLinked(businessName), "HTML");
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private void sendByBusinessId(UUID businessId, String text, String parseMode) {
        if (!enabled) return;

        String chatId = resolveChatId(businessId);
        if (chatId == null || chatId.isBlank()) {
            log.debug("[Telegram] No group chat ID for business={}", businessId);
            return;
        }

        sendToChatId(chatId, text, parseMode);
    }

    private void sendToChatId(String chatId, String text, String parseMode) {
        if (!enabled) return;

        try {
            String url = String.format(SEND_MESSAGE_URL, botToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", text);
            body.put("parse_mode", parseMode);

            restTemplate.postForObject(url, new HttpEntity<>(body, headers), String.class);
            log.debug("[Telegram] Message sent to chat_id={}", chatId);
        } catch (Exception e) {
            log.warn("[Telegram] Failed to send to chat_id={}: {}", chatId, e.getMessage());
        }
    }

    private String resolveChatId(UUID businessId) {
        return businessSettingRepository
                .findByBusinessIdAndIsDeletedFalse(businessId)
                .map(BusinessSetting::getTelegramGroupChatId)
                .orElse(null);
    }
}
