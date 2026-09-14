package com.emenu.features.telegram.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.constant.ApiEndpoints;
import com.emenu.features.telegram.dto.TelegramCustomMessageRequest;
import com.emenu.features.telegram.dto.TelegramNotificationResponse;
import com.emenu.features.telegram.service.TelegramService;
import com.emenu.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping(ApiEndpoints.TELEGRAM_BASE)
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class TelegramController {

    private final TelegramService telegramService;

    @PostMapping(ApiEndpoints.TELEGRAM_SEND)
    public Mono<ApiResponse<TelegramNotificationResponse>> sendCustomNotification(@Valid @RequestBody TelegramCustomMessageRequest request) {
        return Mono.fromCallable(() -> ApiResponse.success("Telegram notification dispatched successfully", telegramService.sendCustomNotification(request)));
    }
}
