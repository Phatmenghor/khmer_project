package com.emenu.features.payment.payway.controller;

import com.emenu.features.payment.payway.dto.PayWayWebhookPayload;
import com.emenu.features.payment.payway.service.PayWayGatewayClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments/payway-callback")
@RequiredArgsConstructor
@Tag(name = "PayWay Payment Webhook Receiver", description = "Receives verified payment completion webhooks from PayWay Middleware microservice")
public class PayWayWebhookController {

    private final PayWayGatewayClientService gatewayClientService;

    @PostMapping
    @Operation(summary = "Process payment completion webhook from PayWay Middleware")
    public ResponseEntity<Map<String, Object>> handlePaymentWebhook(@RequestBody PayWayWebhookPayload payload) {
        Map<String, Object> response = gatewayClientService.handlePaymentWebhook(payload);
        return ResponseEntity.ok(response);
    }
}
