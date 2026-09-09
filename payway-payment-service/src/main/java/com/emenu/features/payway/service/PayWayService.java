package com.emenu.features.payway.service;

import com.emenu.features.payway.dto.PayWayCheckTransactionRequest;
import com.emenu.features.payway.dto.PayWayCheckoutRequest;
import com.emenu.features.payway.dto.PayWayCheckoutResponse;
import com.emenu.features.payway.dto.PayWayTransactionResponse;
import com.emenu.features.payway.dto.PayWayWebhookPayload;

import java.util.Map;

public interface PayWayService {

    PayWayCheckoutResponse createCheckout(PayWayCheckoutRequest request);

    PayWayCheckoutResponse createKhqrPayment(PayWayCheckoutRequest request);

    PayWayTransactionResponse checkTransactionStatus(PayWayCheckTransactionRequest request);

    Map<String, Object> handlePaymentWebhook(PayWayWebhookPayload payload);
}
