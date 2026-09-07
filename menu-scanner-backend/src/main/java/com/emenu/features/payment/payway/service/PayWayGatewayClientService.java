package com.emenu.features.payment.payway.service;

import com.emenu.features.payment.payway.dto.PayWayCheckTransactionRequest;
import com.emenu.features.payment.payway.dto.PayWayCheckoutRequest;
import com.emenu.features.payment.payway.dto.PayWayCheckoutResponse;
import com.emenu.features.payment.payway.dto.PayWayTransactionResponse;
import com.emenu.features.payment.payway.dto.PayWayWebhookPayload;

import java.math.BigDecimal;
import java.util.Map;

public interface PayWayGatewayClientService {

    PayWayCheckoutResponse createCheckout(PayWayCheckoutRequest request);

    PayWayCheckoutResponse createKhqrPayment(PayWayCheckoutRequest request);

    PayWayTransactionResponse checkTransactionStatus(PayWayCheckTransactionRequest request);

    Map<String, Object> refundTransaction(String tranId, BigDecimal amount, String reason);

    Map<String, Object> handlePaymentWebhook(PayWayWebhookPayload payload);

    Map<String, Object> checkBakongTransactionByMd5(String qrStringOrMd5);

    Map<String, Object> checkBakongTransactionByHash(String hash);
}
