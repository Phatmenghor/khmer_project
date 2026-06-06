package com.emenu.features.notification.telegram.controller;

import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/telegram")
@Slf4j
public class TelegramWebhookController {

    private final TelegramNotificationService telegramNotificationService;

    public TelegramWebhookController(TelegramNotificationService telegramNotificationService) {
        this.telegramNotificationService = telegramNotificationService;
    }
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Map<String, String>>> handleWebhook(
            @RequestBody Map<String, Object> update) {
        try {
            if (update.get("message") == null) {
                return ResponseEntity.ok(ApiResponse.success("Update processed", new HashMap<>()));
            }

            Map<String, Object> message = (Map<String, Object>) update.get("message");
            String text = (String) message.get("text");
            Number chatIdNum = (Number) message.get("chat_id");
            if (chatIdNum == null) {
                Map<String, Object> chat = (Map<String, Object>) message.get("chat");
                if (chat != null) {
                    chatIdNum = (Number) chat.get("id");
                }
            }

            if (text == null || chatIdNum == null) {
                return ResponseEntity.ok(ApiResponse.success("Update processed", new HashMap<>()));
            }

            long chatId = chatIdNum.longValue();
            String response = handleCommand(text, chatId);

            Map<String, String> result = new HashMap<>();
            result.put("message", response);
            return ResponseEntity.ok(ApiResponse.success("Webhook processed", result));
        } catch (Exception e) {
            log.error("[Telegram Webhook] Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.failure("Error processing webhook: " + e.getMessage()));
        }
    }
    private String handleCommand(String text, long chatId) {
        if (text == null || !text.startsWith("/")) {
            return "Please use /link <business-id> to link this group to your business.";
        }

        String[] parts = text.trim().split("\\s+");
        String command = parts[0].toLowerCase();

        if ("/link".equals(command)) {
            if (parts.length < 2) {
                return "Usage: /link <business-id>\nExample: /link 550cad56-cafd-4aba-baef-c4dcd53940d0";
            }

            String businessIdStr = parts[1];
            try {
                UUID businessId = UUID.fromString(businessIdStr);
                String businessName = telegramNotificationService.linkGroupToBusinessId(businessId, chatId);

                if (businessName != null) {
                    log.info("[Telegram Webhook] Successfully linked group {} to business {}", chatId, businessId);
                    telegramNotificationService.notifyGroupLinked(chatId, businessName);
                    return "Group successfully linked to " + businessName + ".";
                } else {
                    return "Business not found. Please check the business ID.";
                }
            } catch (IllegalArgumentException e) {
                return "Invalid business ID format. Please use a valid UUID.";
            } catch (Exception e) {
                log.error("[Telegram Webhook] Error linking group: {}", e.getMessage(), e);
                return "Error linking group: " + e.getMessage();
            }
        }

        return "Unknown command. Use /link <business-id> to link this group.";
    }

    @PostMapping("/test/{businessId}")
    public ResponseEntity<ApiResponse<String>> sendTestMessage(
            @PathVariable UUID businessId) {
        try {
            telegramNotificationService.sendTestMessage(businessId);
            return ResponseEntity.ok(ApiResponse.success("Test message sent successfully", null));
        } catch (Exception e) {
            log.error("[Telegram] Error sending test message: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Failed to send test message: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{businessId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTelegramStatus(
            @PathVariable UUID businessId) {
        try {
            var status = telegramNotificationService.getStatus(businessId);
            Map<String, Object> result = new HashMap<>();
            result.put("isLinked", status.isLinked());
            result.put("chatId", status.getChatId());
            return ResponseEntity.ok(ApiResponse.success("Telegram status retrieved", result));
        } catch (Exception e) {
            log.error("[Telegram] Error getting status: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Failed to get status: " + e.getMessage()));
        }
    }
}
