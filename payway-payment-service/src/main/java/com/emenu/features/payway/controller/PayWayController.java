package com.emenu.features.payway.controller;

import com.emenu.features.payway.dto.PayWayCheckTransactionRequest;
import com.emenu.features.payway.dto.PayWayCheckoutRequest;
import com.emenu.features.payway.dto.PayWayCheckoutResponse;
import com.emenu.features.payway.dto.PayWayTransactionResponse;
import com.emenu.features.payway.dto.PayWayWebhookPayload;
import com.emenu.features.payway.service.PayWayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments/payway")
@RequiredArgsConstructor
@Tag(name = "ABA PayWay Controller", description = "Endpoints for ABA PayWay checkout, KHQR payments, check-transaction, and webhooks")
public class PayWayController {

    private final PayWayService payWayService;

    @PostMapping("/checkout")
    @Operation(summary = "Create ABA PayWay checkout transaction and signature")
    public ResponseEntity<PayWayCheckoutResponse> createCheckout(@Valid @RequestBody PayWayCheckoutRequest request) {
        log.info("Received request to create ABA PayWay checkout for tranId: {}", request.getTranId());
        PayWayCheckoutResponse response = payWayService.createCheckout(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/khqr")
    @Operation(summary = "Create ABA PayWay KHQR payment")
    public ResponseEntity<PayWayCheckoutResponse> createKhqrPayment(@Valid @RequestBody PayWayCheckoutRequest request) {
        log.info("Received request to create ABA PayWay KHQR payment for tranId: {}", request.getTranId());
        PayWayCheckoutResponse response = payWayService.createKhqrPayment(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-transaction")
    @Operation(summary = "Check status of an ABA PayWay transaction by tran_id")
    public ResponseEntity<PayWayTransactionResponse> checkTransaction(@Valid @RequestBody PayWayCheckTransactionRequest request) {
        log.info("Received request to check status of ABA PayWay transaction for tranId: {}", request.getTranId());
        PayWayTransactionResponse response = payWayService.checkTransactionStatus(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Handle incoming ABA PayWay payment webhook callback")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody PayWayWebhookPayload payload) {
        log.info("Received ABA PayWay webhook notification for tranId: {}, status: {}", payload.getTranId(), payload.getStatus());
        Map<String, Object> result = payWayService.handlePaymentWebhook(payload);
        return ResponseEntity.ok(result);
    }
}
