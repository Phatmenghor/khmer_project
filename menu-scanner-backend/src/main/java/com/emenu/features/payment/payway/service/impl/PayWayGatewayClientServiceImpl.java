package com.emenu.features.payment.payway.service.impl;

import com.emenu.enums.payment.PaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderPayment;
import com.emenu.features.order.repository.OrderPaymentRepository;
import com.emenu.features.order.repository.OrderRepository;
import com.emenu.features.payment.payway.config.PayWayGatewayProperties;
import com.emenu.features.payment.payway.dto.PayWayCheckTransactionRequest;
import com.emenu.features.payment.payway.dto.PayWayCheckoutRequest;
import com.emenu.features.payment.payway.dto.PayWayCheckoutResponse;
import com.emenu.features.payment.payway.dto.PayWayTransactionResponse;
import com.emenu.features.payment.payway.dto.PayWayWebhookPayload;
import com.emenu.features.payment.payway.service.PayWayGatewayClientService;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPayment;
import com.emenu.features.subscription.repository.SubscriptionPaymentRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayWayGatewayClientServiceImpl implements PayWayGatewayClientService {

    private final PayWayGatewayProperties payWayGatewayProperties;
    private final TelegramNotificationService telegramNotificationService;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final OrderRepository orderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public PayWayCheckoutResponse createCheckout(PayWayCheckoutRequest request) {
        String targetUrl = payWayGatewayProperties.getServiceUrl() + "/api/v1/payments/payway/checkout";
        return sendRequestToGateway(targetUrl, request);
    }

    @Override
    public PayWayCheckoutResponse createKhqrPayment(PayWayCheckoutRequest request) {
        String targetUrl = payWayGatewayProperties.getServiceUrl() + "/api/v1/payments/payway/khqr";
        return sendRequestToGateway(targetUrl, request);
    }

    @Override
    @Transactional
    public PayWayTransactionResponse checkTransactionStatus(PayWayCheckTransactionRequest request) {
        String targetUrl = payWayGatewayProperties.getServiceUrl() + "/api/v1/payments/payway/check-transaction";
        HttpHeaders headers = createAuthHeaders();
        HttpEntity<PayWayCheckTransactionRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<ApiResponse<PayWayTransactionResponse>> responseEntity = restTemplate.exchange(
                    targetUrl,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<ApiResponse<PayWayTransactionResponse>>() {}
            );

            if (responseEntity.getBody() != null && responseEntity.getBody().getData() != null) {
                PayWayTransactionResponse txResp = responseEntity.getBody().getData();
                if (txResp.getStatus() != null && "00".equals(txResp.getStatus().getCode())) {
                    processSuccessfulTransaction(txResp.getTranId());
                }
                return txResp;
            }
        } catch (Exception e) {
            log.error("Failed to query PayWay middleware status for tranId: {}", request.getTranId(), e);
        }
        return PayWayTransactionResponse.builder()
                .tranId(request.getTranId())
                .status(new PayWayTransactionResponse.StatusInfo("01", "PENDING"))
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> refundTransaction(String tranId, BigDecimal amount, String reason) {
        String targetUrl = payWayGatewayProperties.getServiceUrl() + "/api/v1/payments/payway/refund";
        HttpHeaders headers = createAuthHeaders();
        Map<String, Object> req = new HashMap<>();
        req.put("tran_id", tranId);
        req.put("amount", amount);
        req.put("reason", reason);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);
        ResponseEntity<ApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                targetUrl,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {}
        );
        if (response.getBody() != null && response.getBody().getData() != null) {
            return response.getBody().getData();
        }
        return Map.of("status", "0", "message", "Refund processed");
    }

    @Override
    @Transactional
    public Map<String, Object> handlePaymentWebhook(PayWayWebhookPayload payload) {
        log.info("Received Payment Webhook from PayWay Middleware for tranId: {}, status: {}", payload.getTranId(), payload.getStatus());

        if ("PAID".equalsIgnoreCase(payload.getStatus()) || "SUCCESS".equalsIgnoreCase(payload.getStatus())) {
            processSuccessfulTransaction(payload.getTranId());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Webhook processed successfully");
        return response;
    }

    private PayWayCheckoutResponse sendRequestToGateway(String url, PayWayCheckoutRequest request) {
        HttpHeaders headers = createAuthHeaders();
        HttpEntity<PayWayCheckoutRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<ApiResponse<PayWayCheckoutResponse>> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<ApiResponse<PayWayCheckoutResponse>>() {}
        );

        if (responseEntity.getBody() != null && responseEntity.getBody().getData() != null) {
            return responseEntity.getBody().getData();
        }
        throw new IllegalStateException("Failed to receive checkout response from PayWay Gateway Middleware");
    }

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Api-Key", payWayGatewayProperties.getApiKey());
        return headers;
    }

    private void processSuccessfulTransaction(String tranId) {
        log.info("Processing completed payment for tranId: {}", tranId);

        // 1. Subscription Payment
        Optional<SubscriptionPayment> subPaymentOpt = subscriptionPaymentRepository.findByReferenceNumber(tranId);
        if (subPaymentOpt.isPresent()) {
            SubscriptionPayment subPayment = subPaymentOpt.get();
            subPayment.setStatus(SubscriptionPaymentStatus.COMPLETED);
            subscriptionPaymentRepository.save(subPayment);

            Optional<Subscription> subscriptionOpt = subscriptionRepository.findById(subPayment.getSubscriptionId());
            if (subscriptionOpt.isPresent()) {
                Subscription subscription = subscriptionOpt.get();
                try {
                    telegramNotificationService.notifySubscriptionReceiptPdf(subscription.getId());
                } catch (Exception e) {
                    log.error("Failed to trigger Telegram subscription receipt PDF notification", e);
                }
            }
            return;
        }

        // 2. Order Payment
        Optional<OrderPayment> orderPaymentOpt = orderPaymentRepository.findByPaymentReference(tranId);
        if (orderPaymentOpt.isPresent()) {
            OrderPayment orderPayment = orderPaymentOpt.get();
            orderPayment.setStatus(PaymentStatus.PAID);
            orderPaymentRepository.save(orderPayment);

            Optional<Order> orderOpt = orderRepository.findById(orderPayment.getOrderId());
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setPaymentStatus(PaymentStatus.PAID);
                orderRepository.save(order);
            }
        }
    }

    @Override
    public Map<String, Object> checkBakongTransactionByMd5(String qrStringOrMd5) {
        String targetUrl = payWayGatewayProperties.getServiceUrl() + "/api/v1/payments/bakong/check-md5";
        HttpHeaders headers = createAuthHeaders();
        Map<String, String> req = Map.of("md5", qrStringOrMd5);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(req, headers);

        try {
            ResponseEntity<ApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                    targetUrl, HttpMethod.POST, entity,
                    new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {}
            );
            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            log.error("Failed to query Bakong MD5 transaction status", e);
        }
        return Map.of("responseCode", 1, "responseMessage", "Failed to query Bakong transaction");
    }

    @Override
    public Map<String, Object> checkBakongTransactionByHash(String hash) {
        String targetUrl = payWayGatewayProperties.getServiceUrl() + "/api/v1/payments/bakong/check-hash";
        HttpHeaders headers = createAuthHeaders();
        Map<String, String> req = Map.of("hash", hash);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(req, headers);

        try {
            ResponseEntity<ApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                    targetUrl, HttpMethod.POST, entity,
                    new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {}
            );
            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            log.error("Failed to query Bakong Hash transaction status", e);
        }
        return Map.of("responseCode", 1, "responseMessage", "Failed to query Bakong transaction");
    }
}
