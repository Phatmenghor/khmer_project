package com.emenu.features.notification.telegram.service.impl;

import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.notification.telegram.TelegramMessageBuilder;
import com.emenu.features.notification.telegram.dto.response.TelegramStatusResponse;
import com.emenu.features.notification.telegram.mapper.TelegramNotificationMapper;
import com.emenu.features.notification.telegram.models.TelegramMessageLog;
import com.emenu.features.notification.telegram.repository.TelegramMessageLogRepository;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.notification.telegram.util.PdfReceiptGenerator;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.TableSession;
import com.emenu.features.order.models.TableSessionItem;
import com.emenu.features.spaces.service.SpacesService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.features.subscription.util.SubscriptionPdfReceiptGenerator;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.UserRepository;
import java.time.LocalDate;

@Service
@Slf4j
public class TelegramNotificationServiceImpl implements TelegramNotificationService {

    private static final String SEND_MESSAGE_URL = "https://api.telegram.org/bot%s/sendMessage";
    private static final String SEND_DOCUMENT_URL = "https://api.telegram.org/bot%s/sendDocument";

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Value("${telegram.bot.enabled:true}")
    private boolean enabled;

    @Value("${telegram.bot.group-chat-id:}")
    private String adminGroupChatId;

    @Value("${telegram.bot.order-group-chat-id:}")
    private String orderGroupChatId;

    @Value("${telegram.bot.subscription-group-chat-id:}")
    private String subscriptionGroupChatId;

    @Value("${telegram.bot.staff-group-chat-id:}")
    private String staffGroupChatId;

    private final BusinessSettingRepository businessSettingRepository;
    private final TelegramNotificationMapper telegramNotificationMapper;
    private final RestTemplate restTemplate;
    private final TelegramMessageLogRepository telegramMessageLogRepository;
    private final SpacesService spacesService;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public TelegramNotificationServiceImpl(
            BusinessSettingRepository businessSettingRepository,
            TelegramNotificationMapper telegramNotificationMapper,
            @Qualifier("telegramRestTemplate") RestTemplate restTemplate,
            TelegramMessageLogRepository telegramMessageLogRepository,
            SpacesService spacesService,
            SubscriptionRepository subscriptionRepository,
            UserRepository userRepository) {
        this.businessSettingRepository = businessSettingRepository;
        this.telegramNotificationMapper = telegramNotificationMapper;
        this.restTemplate = restTemplate;
        this.telegramMessageLogRepository = telegramMessageLogRepository;
        this.spacesService = spacesService;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
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
        log.info("[Telegram Service] Sending test message for business={}", businessId);
        sendByBusinessId(businessId, TelegramMessageBuilder.testMessage(), "HTML", null, null, null);
    }

    // ── Low-level send ────────────────────────────────────────────────────────

    @Override
    @Async("taskExecutor")
    public void sendToGroup(UUID businessId, String message) {
        sendByBusinessId(businessId, message, "HTML", null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void sendHtmlToGroup(UUID businessId, String htmlMessage) {
        sendByBusinessId(businessId, htmlMessage, "HTML", null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void sendAdminAlert(String message) {
        if (!enabled || adminGroupChatId == null || adminGroupChatId.isBlank()) {
            log.info("[Telegram Service] Admin alerts disabled or no admin group chat ID configured");
            return;
        }
        log.info("[Telegram Service] Dispatching admin alert to chat_id={}", adminGroupChatId);
        sendToChatId(adminGroupChatId, message, "HTML", null, null, null);
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
        log.info("[Telegram Service] Linked group chat_id={} to business_id={}", chatId, businessId);
        return setting.getBusiness() != null && setting.getBusiness().getName() != null
                ? setting.getBusiness().getName() : "your business";
    }

    // ── Order notifications (Fully Async) ─────────────────────────────────────

    @Override
    @Async("taskExecutor")
    public void notifyNewCustomerOrder(Order order) {
        if (order == null) return;
        log.info("[Telegram Service] Preparing new customer order notification & PDF for order #{}", order.getOrderNumber());
        processAndSendOrderNotification("NEW_CUSTOMER_ORDER", TelegramMessageBuilder.newCustomerOrder(order), order);
    }

    @Override
    @Async("taskExecutor")
    public void notifyNewPOSOrder(Order order) {
        if (order == null) return;
        log.info("[Telegram Service] Preparing new POS order notification & PDF for order #{}", order.getOrderNumber());
        processAndSendOrderNotification("NEW_POS_ORDER", TelegramMessageBuilder.newPOSOrder(order), order);
    }

    @Override
    @Async("taskExecutor")
    public void notifyOrderStatusChanged(Order order) {
        if (order == null) return;
        log.info("[Telegram Service] Preparing order status change notification & PDF for order #{} (Status: {})",
                order.getOrderNumber(), order.getOrderStatus());
        processAndSendOrderNotification("ORDER_STATUS_CHANGED", TelegramMessageBuilder.orderStatusChanged(order), order);
    }

    // ── Table Session notifications (Async Text-Only) ─────────────────────────

    @Override
    @Async("taskExecutor")
    public void notifyTableSessionItemAdded(TableSession session, TableSessionItem newItem) {
        if (!enabled || session == null || session.getBusinessId() == null) return;
        log.info("[Telegram Service] Preparing text notification for table session item addition: session={}, table={}",
                session.getSessionNumber(), session.getTableNumber());
        String msg = TelegramMessageBuilder.newTableSessionItem(session, newItem);
        sendByBusinessId(session.getBusinessId(), msg, "HTML", null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void notifyTableSessionRoundAdded(TableSession session, int orderRound, List<TableSessionItem> addedItems) {
        if (!enabled || session == null || session.getBusinessId() == null) return;
        log.info("[Telegram Service] Preparing text notification for table session round addition: session={}, table={}, round={}, items_count={}",
                session.getSessionNumber(), session.getTableNumber(), orderRound, addedItems != null ? addedItems.size() : 0);
        String msg = TelegramMessageBuilder.newTableSessionRound(session, orderRound, addedItems);
        sendByBusinessId(session.getBusinessId(), msg, "HTML", null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void notifyTableSessionSettled(TableSession session, Order order) {
        if (!enabled || session == null || session.getBusinessId() == null) return;
        log.info("[Telegram Service] Preparing text notification for settled table session: session={}, order={}",
                session.getSessionNumber(), order.getOrderNumber());
        String msg = TelegramMessageBuilder.tableSessionSettled(session, order);
        sendByBusinessId(session.getBusinessId(), msg, "HTML", null, null, null);
    }

    // ── Staff notifications (Async) ───────────────────────────────────────────

    @Override
    @Async("taskExecutor")
    public void notifyNewStaff(UUID businessId, String name, String position,
                               String phone, String email, List<String> roles) {
        log.info("[Telegram Service] Sending new staff alert for business={}, staff={}", businessId, name);
        String msg = TelegramMessageBuilder.newStaff(name, position, phone, email, roles);
        sendAdminAlert(msg);
        String staffChatId = resolveStaffChatId(businessId);
        if (staffChatId != null && !staffChatId.isBlank() && !staffChatId.equals(adminGroupChatId)) {
            sendToChatId(staffChatId, msg, "HTML", businessId, null, null);
        }
    }

    // ── Subscription notifications (Async) ───────────────────────────────────

    @Override
    @Async("taskExecutor")
    public void notifyBusinessOwnerRegistered(UUID businessId, String ownerName, String businessName,
                                              String planName, String expiryDate) {
        notifyBusinessOwnerRegistered(businessId, ownerName, businessName, null, null, planName, expiryDate, null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void notifyBusinessOwnerRegistered(UUID businessId, String ownerName, String businessName,
                                              String ownerPhone, String ownerEmail,
                                              String planName, String expiryDate,
                                              BigDecimal paymentAmount, String paymentMethod, String paymentReference) {
        String msg = TelegramMessageBuilder.businessOwnerRegistered(ownerName, businessName, ownerPhone, ownerEmail,
                planName, expiryDate, paymentAmount, paymentMethod, paymentReference);
        sendSubscriptionNotification(businessId, msg);
        log.info("[Telegram Service] Business owner registration alert sent for: {}", businessName);
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionExpiringSoon(UUID businessId, String businessName,
                                               long daysRemaining, String expiryDate) {
        String msg = TelegramMessageBuilder.subscriptionExpiringSoon(businessName, daysRemaining, expiryDate);
        sendSubscriptionNotification(businessId, msg);
        log.info("[Telegram Service] Subscription expiring soon alert sent for: {} (days remaining: {})", businessName, daysRemaining);
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionRenewed(UUID businessId, String businessName,
                                          String planName, String newExpiryDate) {
        notifySubscriptionRenewed(businessId, businessName, null, null, null, planName, newExpiryDate, null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionRenewed(UUID businessId, String businessName,
                                          String ownerName, String ownerPhone, String ownerEmail,
                                          String planName, String newExpiryDate,
                                          BigDecimal paymentAmount, String paymentMethod, String paymentReference) {
        String msg = TelegramMessageBuilder.subscriptionRenewed(businessName, ownerName, ownerPhone, ownerEmail,
                planName, newExpiryDate, paymentAmount, paymentMethod, paymentReference);
        sendSubscriptionNotification(businessId, msg);
        log.info("[Telegram Service] Subscription renewal alert sent for: {}", businessName);
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionCancelled(UUID businessId, String businessName) {
        notifySubscriptionCancelled(businessId, businessName, null, null, null, null, null, null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionCancelled(UUID businessId, String businessName,
                                            String ownerName, String ownerPhone, String ownerEmail,
                                            String planName, String reason,
                                            BigDecimal refundAmount, String paymentMethod, String paymentReference) {
        String msg = TelegramMessageBuilder.subscriptionCancelled(businessName, ownerName, ownerPhone, ownerEmail,
                planName, reason, refundAmount, paymentMethod, paymentReference);
        sendSubscriptionNotification(businessId, msg);
        log.info("[Telegram Service] Subscription cancellation alert sent for: {}", businessName);
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionPlanChanged(UUID businessId, String businessName,
                                              String oldPlanName, String newPlanName, String newExpiryDate) {
        notifySubscriptionPlanChanged(businessId, businessName, null, null, null, oldPlanName, newPlanName, newExpiryDate, null, null, null);
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionPlanChanged(UUID businessId, String businessName,
                                              String ownerName, String ownerPhone, String ownerEmail,
                                              String oldPlanName, String newPlanName, String newExpiryDate,
                                              BigDecimal paymentAmount, String paymentMethod, String paymentReference) {
        String msg = TelegramMessageBuilder.subscriptionPlanChanged(businessName, ownerName, ownerPhone, ownerEmail,
                oldPlanName, newPlanName, newExpiryDate, paymentAmount, paymentMethod, paymentReference);
        sendSubscriptionNotification(businessId, msg);
        log.info("[Telegram Service] Subscription plan change alert sent for: {} (from {} to {})", businessName, oldPlanName, newPlanName);
    }

    private void sendSubscriptionNotification(UUID businessId, String msg) {
        sendAdminAlert(msg);
        String subChatId = resolveSubscriptionChatId(businessId);
        if (subChatId != null && !subChatId.isBlank() && !subChatId.equals(adminGroupChatId)) {
            sendToChatId(subChatId, msg, "HTML", businessId, null, null);
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifySubscriptionReceiptPdf(UUID subscriptionId) {
        if (!enabled || subscriptionId == null) return;
        try {
            log.info("[Telegram Service] Asynchronously processing Subscription PDF Receipt for subscriptionId={}", subscriptionId);
            Subscription subscription = subscriptionRepository.findByIdWithRelationships(subscriptionId).orElse(null);
            if (subscription == null) return;

            UUID businessId = subscription.getBusinessId();
            String chatId = resolveSubscriptionChatId(businessId);
            if (chatId == null || chatId.isBlank()) {
                log.info("[Telegram Service] No Telegram group chat ID resolved for subscription. Skipping PDF push for subscriptionId={}", subscriptionId);
                return;
            }

            BusinessSetting settings = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId).orElse(null);
            User owner = null;
            if (subscription.getBusiness() != null && subscription.getBusiness().getOwnerId() != null) {
                owner = userRepository.findByIdAndIsDeletedFalse(subscription.getBusiness().getOwnerId()).orElse(null);
            }

            byte[] pdfBytes = SubscriptionPdfReceiptGenerator.generateReceiptPdf(subscription, settings, owner);
            if (pdfBytes != null && pdfBytes.length > 0) {
                String datePart = subscription.getCreatedAt() != null
                        ? subscription.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                        : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                String codePart = subscription.getId() != null ? subscription.getId().toString().substring(0, 8).toUpperCase() : "00000000";
                String pdfFileName = String.format("subscription-receipt-SUB-%s-%s.pdf", datePart, codePart);

                String caption = String.format("📑 Official Subscription Receipt for %s (#SUB-%s-%s)",
                        subscription.getBusiness() != null ? subscription.getBusiness().getName() : "Store",
                        datePart, codePart);

                sendDocumentToChatId(chatId, pdfBytes, pdfFileName, caption);
                log.info("[Telegram Service] Subscription PDF Receipt successfully dispatched as document to Telegram chat_id={}", chatId);
            }
        } catch (Exception e) {
            log.error("[Telegram Service] Failed to send Subscription PDF Receipt to Telegram for subscriptionId={}: {}",
                    subscriptionId, e.getMessage(), e);
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyTableReset(UUID businessId, String tableNumber) {
        String msg = "<b>🔄 TABLE RESET NOTIFICATION</b>\n\n" +
                "<b>Table #:</b> " + tableNumber + "\n" +
                "<b>Status:</b> 🟢 AVAILABLE\n" +
                "<b>Notice:</b> Table session and active dining orders cleared.\n" +
                "<b>Time:</b> " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        sendHtmlToGroup(businessId, msg);
        log.info("[Telegram Service] Table reset notification sent for businessId: {}, tableNumber: {}", businessId, tableNumber);
    }

    // ── Bot events ────────────────────────────────────────────────────────────

    @Override
    @Async("taskExecutor")
    public void notifyGroupLinked(long chatId, String businessName) {
        sendToChatId(String.valueOf(chatId), TelegramMessageBuilder.groupLinked(businessName), "HTML", null, null, null);
    }

    // ── Helper method for Order Notification Processing & PDF Dispatch ───────────────────────

    private void processAndSendOrderNotification(String eventType, String messageText, Order order) {
        if (!enabled) {
            log.info("[Telegram Service] Telegram bot disabled. Skipping event [{}] for order #{}", eventType, order.getOrderNumber());
            return;
        }

        String chatId = resolveChatId(order.getBusinessId());
        if (chatId == null || chatId.isBlank()) {
            log.info("[Telegram Service] No Telegram group chat ID configured for businessId={}. Order #{} notification skipped.",
                    order.getBusinessId(), order.getOrderNumber());
            return;
        }

        // Fetch BusinessSetting to obtain receiptSize & WiFi/contact info
        BusinessSetting settings = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(order.getBusinessId()).orElse(null);

        // Generate backend API receipt URL for logging & direct access
        String receiptUrl = String.format("/api/v1/orders/%s/receipt/pdf", order.getId());
        byte[] pdfBytes = null;
        String pdfFileName = String.format("receipt-%s.pdf", order.getOrderNumber() != null ? order.getOrderNumber() : "order");

        // 1. Generate 1-Page Thermal PDF receipt matching BusinessSetting receiptSize
        try {
            pdfBytes = PdfReceiptGenerator.generatePdfReceipt(order, settings);
            log.info("[Telegram Service] Successfully generated PDF receipt bytes for order #{}, size={} bytes", order.getOrderNumber(), pdfBytes.length);
        } catch (Exception pdfEx) {
            log.warn("[Telegram Service] Failed to generate PDF receipt for order #{}: {}", order.getOrderNumber(), pdfEx.getMessage());
        }

        // 2. Send Clean Normal HTML Text Message to Telegram Group
        sendToChatId(chatId, messageText, "HTML", order.getBusinessId(), receiptUrl, null);

        // 3. Send Downloadable PDF Receipt Document directly to Telegram Group
        if (pdfBytes != null && pdfBytes.length > 0) {
            sendDocumentToChatId(chatId, pdfBytes, pdfFileName, null);
        }
    }

    // ── Low-level HTTP dispatch to Telegram Bot API ────────────────────────────

    private void sendByBusinessId(UUID businessId, String text, String parseMode, UUID orderBusinessId, String receiptUrl, String storageKey) {
        if (!enabled) return;

        String chatId = resolveChatId(businessId);
        if (chatId == null || chatId.isBlank()) {
            log.info("[Telegram Service] No group chat ID resolved for businessId={}", businessId);
            return;
        }

        sendToChatId(chatId, text, parseMode, businessId, receiptUrl, storageKey);
    }

    private void sendToChatId(String chatId, String text, String parseMode, UUID businessId, String receiptUrl, String storageKey) {
        if (!enabled) return;

        String status = "SUCCESS";
        String errorMessage = null;

        try {
            String url = String.format(SEND_MESSAGE_URL, botToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", text);
            body.put("parse_mode", parseMode);

            restTemplate.postForObject(url, new HttpEntity<>(body, headers), String.class);
            log.info("[Telegram Service] Text message successfully pushed to Telegram chat_id={}", chatId);
        } catch (Exception e) {
            status = "FAILED";
            errorMessage = e.getMessage();
            log.error("[Telegram Service] Failed to push text message to Telegram chat_id={}: {}", chatId, e.getMessage());
        }

        // Persist notification log entry
        try {
            UUID resolvedBusinessId = businessId;
            if (resolvedBusinessId == null) {
                resolvedBusinessId = businessSettingRepository.findFirstByTelegramGroupChatIdAndIsDeletedFalse(chatId)
                        .map(BusinessSetting::getBusinessId)
                        .orElse(null);
            }

            TelegramMessageLog logEntity = TelegramMessageLog.builder()
                    .businessId(resolvedBusinessId)
                    .chatId(chatId)
                    .messageText(text)
                    .parseMode(parseMode)
                    .status(status)
                    .errorMessage(errorMessage)
                    .receiptUrl(receiptUrl)
                    .storageKey(storageKey)
                    .build();

            telegramMessageLogRepository.save(logEntity);
            log.info("[Telegram Service] Saved message log: chatId={}, status={}, receiptUrl={}", chatId, status, receiptUrl);
        } catch (Exception dbEx) {
            log.error("[Telegram Service] Failed to save telegram message log in database", dbEx);
        }
    }

    private void sendDocumentToChatId(String chatId, byte[] fileBytes, String filename, String caption) {
        if (!enabled || fileBytes == null || fileBytes.length == 0) return;

        try {
            String url = String.format(SEND_DOCUMENT_URL, botToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("chat_id", chatId);
            body.add("document", new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });
            if (caption != null && !caption.isBlank()) {
                body.add("caption", caption);
            }

            restTemplate.postForObject(url, new HttpEntity<>(body, headers), String.class);
            log.info("[Telegram Service] PDF Receipt Document [{}] successfully pushed to Telegram chat_id={}", filename, chatId);
        } catch (Exception e) {
            log.error("[Telegram Service] Failed to push PDF document [{}] to Telegram chat_id={}: {}", filename, chatId, e.getMessage());
        }
    }

    private String resolveChatId(UUID businessId) {
        return resolveOrderChatId(businessId);
    }

    private String resolveOrderChatId(UUID businessId) {
        if (businessId != null) {
            Optional<BusinessSetting> opt = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId);
            if (opt.isPresent()) {
                String id = opt.get().getResolvedOrderTelegramGroupChatId();
                if (id != null && !id.isBlank()) return id;
            }
        }
        if (orderGroupChatId != null && !orderGroupChatId.isBlank()) return orderGroupChatId;
        return adminGroupChatId;
    }

    private String resolveSubscriptionChatId(UUID businessId) {
        if (businessId != null) {
            Optional<BusinessSetting> opt = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId);
            if (opt.isPresent()) {
                String id = opt.get().getResolvedSubscriptionTelegramGroupChatId();
                if (id != null && !id.isBlank()) return id;
            }
        }
        if (subscriptionGroupChatId != null && !subscriptionGroupChatId.isBlank()) return subscriptionGroupChatId;
        return adminGroupChatId;
    }

    private String resolveStaffChatId(UUID businessId) {
        if (businessId != null) {
            Optional<BusinessSetting> opt = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId);
            if (opt.isPresent()) {
                String id = opt.get().getResolvedStaffTelegramGroupChatId();
                if (id != null && !id.isBlank()) return id;
            }
        }
        if (staffGroupChatId != null && !staffGroupChatId.isBlank()) return staffGroupChatId;
        return adminGroupChatId;
    }
}
