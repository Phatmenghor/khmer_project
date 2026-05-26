package com.emenu.features.notification.telegram.controller;

import com.emenu.features.notification.telegram.dto.response.TelegramStatusResponse;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/telegram")
@RequiredArgsConstructor
@Slf4j
public class TelegramController {

    private final TelegramNotificationService telegramNotificationService;
    private final SecurityUtils securityUtils;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<TelegramStatusResponse>> getStatus() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: telegram-status - business={}", businessId);
        TelegramStatusResponse response = telegramNotificationService.getStatus(businessId);
        return ResponseEntity.ok(ApiResponse.success("Telegram status retrieved", response));
    }

    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Void>> sendTestMessage() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        log.info("Endpoint: telegram-test - business={}", businessId);
        telegramNotificationService.sendTestMessage(businessId);
        return ResponseEntity.ok(ApiResponse.success("Test message sent to your Telegram group", null));
    }
}
