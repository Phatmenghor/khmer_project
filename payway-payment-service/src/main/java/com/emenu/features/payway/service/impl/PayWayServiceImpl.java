package com.emenu.features.payway.service.impl;

import com.emenu.features.bakong.common.TelegramNotifier;
import com.emenu.features.payway.config.PayWayProperties;
import com.emenu.features.payway.dto.PayWayCheckTransactionRequest;
import com.emenu.features.payway.dto.PayWayCheckoutRequest;
import com.emenu.features.payway.dto.PayWayCheckoutResponse;
import com.emenu.features.payway.dto.PayWayTransactionResponse;
import com.emenu.features.payway.dto.PayWayWebhookPayload;
import com.emenu.features.payway.model.PayWayTransaction;
import com.emenu.features.payway.repository.PayWayTransactionRepository;
import com.emenu.features.payway.service.PayWayService;
import com.emenu.features.payway.util.PayWayCryptoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayWayServiceImpl implements PayWayService {

    private final PayWayProperties payWayProperties;
    private final PayWayTransactionRepository transactionRepository;
    private final RestTemplate restTemplate;
    private final TelegramNotifier telegramNotifier;

    private static final DateTimeFormatter REQ_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    @Transactional
    public PayWayCheckoutResponse createCheckout(PayWayCheckoutRequest request) {
        log.info("Creating ABA PayWay checkout for tranId: {}, amount: {}", request.getTranId(), request.getAmount());

        String reqTime = LocalDateTime.now().format(REQ_TIME_FORMATTER);
        String amountStr = request.getAmount() != null ? request.getAmount().setScale(2).toString() : "0.00";
        String paymentOption = request.getPaymentOption() != null ? request.getPaymentOption() : "abapay";

        String hash = PayWayCryptoUtils.getHash(
                reqTime,
                payWayProperties.getMerchantId(),
                request.getTranId(),
                amountStr,
                request.getItems(),
                "", // shipping
                request.getFirstname(),
                request.getLastname(),
                request.getEmail(),
                request.getPhone(),
                request.getType(),
                paymentOption,
                request.getContinueSuccessUrl(),
                request.getReturnUrl(),
                "", // cancel_url
                request.getCurrency(),
                request.getReturnParams(),
                payWayProperties.getApiKey()
        );

        // Save transaction to DB
        PayWayTransaction tx = PayWayTransaction.builder()
                .tranId(request.getTranId())
                .merchantId(payWayProperties.getMerchantId())
                .reqTime(reqTime)
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentOption(paymentOption)
                .status("PENDING")
                .payerName((nullToEmpty(request.getFirstname()) + " " + nullToEmpty(request.getLastname())).trim())
                .payerEmail(request.getEmail())
                .payerPhone(request.getPhone())
                .hash(hash)
                .orderId(request.getOrderId())
                .build();
        transactionRepository.save(tx);

        String checkoutUrl = payWayProperties.getPurchaseUrl();
        String deeplink = String.format("abapay://qr?merchant_id=%s&tran_id=%s&amount=%s",
                payWayProperties.getMerchantId(), request.getTranId(), amountStr);

        return PayWayCheckoutResponse.builder()
                .status("0")
                .description("Checkout initiated successfully")
                .merchantId(payWayProperties.getMerchantId())
                .tranId(request.getTranId())
                .reqTime(reqTime)
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentOption(paymentOption)
                .hash(hash)
                .checkoutUrl(checkoutUrl)
                .abapayDeeplink(deeplink)
                .build();
    }

    @Override
    @Transactional
    public PayWayCheckoutResponse createKhqrPayment(PayWayCheckoutRequest request) {
        log.info("Creating ABA PayWay KHQR payment for tranId: {}, amount: {}", request.getTranId(), request.getAmount());
        request.setPaymentOption("khqr");
        PayWayCheckoutResponse response = createCheckout(request);

        // Standard KHQR response fields
        String qrString = String.format("00020101021238580015kh.gov.nbc.bakong0115%s520459995303840540%s5802KH5907PAYWAY6011PHNOM PENH6304",
                payWayProperties.getMerchantId(), request.getAmount());
        response.setQrString(qrString);
        response.setQrImage("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==");
        return response;
    }

    @Override
    @Transactional
    public PayWayTransactionResponse checkTransactionStatus(PayWayCheckTransactionRequest request) {
        log.info("Checking PayWay transaction status for tranId: {}", request.getTranId());
        String reqTime = LocalDateTime.now().format(REQ_TIME_FORMATTER);

        String hash = PayWayCryptoUtils.getCheckTransactionHash(
                reqTime,
                payWayProperties.getMerchantId(),
                request.getTranId(),
                payWayProperties.getApiKey()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("req_time", reqTime);
        map.add("merchant_id", payWayProperties.getMerchantId());
        map.add("tran_id", request.getTranId());
        map.add("hash", hash);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    payWayProperties.getCheckTransactionUrl(), entity, Map.class);

            if (responseEntity.getBody() != null) {
                Map body = responseEntity.getBody();
                log.info("PayWay check transaction response body for tranId {}: {}", request.getTranId(), body);

                Object statusObj = body.get("status");
                String code = "01";
                String message = "PENDING";
                if (statusObj instanceof Map statusMap) {
                    code = String.valueOf(statusMap.get("code"));
                    message = String.valueOf(statusMap.get("message"));
                } else if (statusObj != null) {
                    code = String.valueOf(statusObj);
                }

                String apv = body.get("apv") != null ? String.valueOf(body.get("apv")) : null;
                BigDecimal totalAmount = body.get("total_amount") != null ?
                        new BigDecimal(String.valueOf(body.get("total_amount"))) : null;
                String currency = body.get("currency") != null ? String.valueOf(body.get("currency")) : "USD";
                String paymentStatus = body.get("payment_status") != null ? String.valueOf(body.get("payment_status")) : message;
                String paymentOption = body.get("payment_option") != null ? String.valueOf(body.get("payment_option")) : "abapay";

                // Update database record
                Optional<PayWayTransaction> existingOpt = transactionRepository.findByTranId(request.getTranId());
                if (existingOpt.isPresent()) {
                    PayWayTransaction tx = existingOpt.get();
                    tx.setStatus(paymentStatus);
                    tx.setApv(apv);
                    transactionRepository.save(tx);
                }

                return PayWayTransactionResponse.builder()
                        .status(new PayWayTransactionResponse.StatusInfo(code, message))
                        .tranId(request.getTranId())
                        .apv(apv)
                        .totalAmount(totalAmount)
                        .currency(currency)
                        .paymentStatus(paymentStatus)
                        .paymentOption(paymentOption)
                        .transactionDate(LocalDateTime.now().toString())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to query upstream ABA PayWay API for tranId: {}, error: {}. Falling back to DB state.",
                    request.getTranId(), e.getMessage());
        }

        // Fallback to local DB record status
        Optional<PayWayTransaction> localTx = transactionRepository.findByTranId(request.getTranId());
        if (localTx.isPresent()) {
            PayWayTransaction tx = localTx.get();
            String code = "APPROVED".equalsIgnoreCase(tx.getStatus()) || "SUCCESS".equalsIgnoreCase(tx.getStatus()) ? "00" : "01";
            return PayWayTransactionResponse.builder()
                    .status(new PayWayTransactionResponse.StatusInfo(code, tx.getStatus()))
                    .tranId(tx.getTranId())
                    .apv(tx.getApv())
                    .totalAmount(tx.getAmount())
                    .currency(tx.getCurrency())
                    .paymentStatus(tx.getStatus())
                    .paymentOption(tx.getPaymentOption())
                    .transactionDate(tx.getUpdatedAt() != null ? tx.getUpdatedAt().toString() : LocalDateTime.now().toString())
                    .build();
        }

        return PayWayTransactionResponse.builder()
                .status(new PayWayTransactionResponse.StatusInfo("01", "PENDING"))
                .tranId(request.getTranId())
                .paymentStatus("PENDING")
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> handlePaymentWebhook(PayWayWebhookPayload payload) {
        log.info("Handling PayWay webhook payload for tranId: {}, status: {}", payload.getTranId(), payload.getStatus());

        Optional<PayWayTransaction> existingOpt = transactionRepository.findByTranId(payload.getTranId());
        if (existingOpt.isPresent()) {
            PayWayTransaction tx = existingOpt.get();
            tx.setStatus(payload.getStatus());
            tx.setApv(payload.getApv());
            if (payload.getAmount() != null) {
                tx.setAmount(payload.getAmount());
            }
            transactionRepository.save(tx);
        } else {
            PayWayTransaction tx = PayWayTransaction.builder()
                    .tranId(payload.getTranId())
                    .merchantId(payWayProperties.getMerchantId())
                    .amount(payload.getAmount() != null ? payload.getAmount() : BigDecimal.ZERO)
                    .currency(payload.getCurrency() != null ? payload.getCurrency() : "USD")
                    .status(payload.getStatus())
                    .apv(payload.getApv())
                    .orderId(payload.getOrderId())
                    .build();
            transactionRepository.save(tx);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "00");
        response.put("message", "Webhook processed successfully");
        response.put("tran_id", payload.getTranId());
        return response;
    }

    private String nullToEmpty(String val) {
        return val == null ? "" : val.trim();
    }
}
