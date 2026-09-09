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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PayWayServiceImplTest {

    @Mock
    private PayWayProperties payWayProperties;

    @Mock
    private PayWayTransactionRepository transactionRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private TelegramNotifier telegramNotifier;

    @InjectMocks
    private PayWayServiceImpl payWayService;

    @BeforeEach
    void setUp() {
        lenient().when(payWayProperties.getMerchantId()).thenReturn("ec477511");
        lenient().when(payWayProperties.getApiKey()).thenReturn("d2b3cc6044e4785508e4e78d4dfdc85b3d58a656");
        lenient().when(payWayProperties.getPurchaseUrl()).thenReturn("https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase");
        lenient().when(payWayProperties.getCheckTransactionUrl()).thenReturn("https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction");
    }

    @Test
    @DisplayName("Should successfully create checkout session and persist transaction")
    void testCreateCheckout() {
        PayWayCheckoutRequest request = PayWayCheckoutRequest.builder()
                .tranId("TX998877")
                .amount(new BigDecimal("15.50"))
                .currency("USD")
                .firstname("Menghor")
                .lastname("Phat")
                .email("phatmenghor19@gmail.com")
                .phone("012345678")
                .build();

        PayWayCheckoutResponse response = payWayService.createCheckout(request);

        assertNotNull(response);
        assertEquals("ec477511", response.getMerchantId());
        assertEquals("TX998877", response.getTranId());
        assertNotNull(response.getHash());
        assertNotNull(response.getCheckoutUrl());
        assertNotNull(response.getAbapayDeeplink());

        ArgumentCaptor<PayWayTransaction> txCaptor = ArgumentCaptor.forClass(PayWayTransaction.class);
        verify(transactionRepository).save(txCaptor.capture());
        assertEquals("TX998877", txCaptor.getValue().getTranId());
        assertEquals("PENDING", txCaptor.getValue().getStatus());
    }

    @Test
    @DisplayName("Should successfully create KHQR payment response")
    void testCreateKhqrPayment() {
        PayWayCheckoutRequest request = PayWayCheckoutRequest.builder()
                .tranId("TX554433")
                .amount(new BigDecimal("25.00"))
                .currency("USD")
                .build();

        PayWayCheckoutResponse response = payWayService.createKhqrPayment(request);

        assertNotNull(response);
        assertNotNull(response.getQrString());
        assertNotNull(response.getQrImage());
        assertEquals("khqr", response.getPaymentOption());
    }

    @Test
    @DisplayName("Should check transaction status using DB fallback if REST call fails")
    void testCheckTransactionStatusFallback() {
        PayWayCheckTransactionRequest request = PayWayCheckTransactionRequest.builder()
                .tranId("TX998877")
                .build();

        PayWayTransaction existingTx = PayWayTransaction.builder()
                .tranId("TX998877")
                .merchantId("ec477511")
                .amount(new BigDecimal("15.50"))
                .currency("USD")
                .status("APPROVED")
                .apv("APV12345")
                .paymentOption("abapay")
                .build();

        when(transactionRepository.findByTranId("TX998877")).thenReturn(Optional.of(existingTx));

        PayWayTransactionResponse response = payWayService.checkTransactionStatus(request);

        assertNotNull(response);
        assertEquals("00", response.getStatus().getCode());
        assertEquals("APPROVED", response.getPaymentStatus());
        assertEquals("APV12345", response.getApv());
    }

    @Test
    @DisplayName("Should handle incoming payment webhook correctly")
    void testHandlePaymentWebhook() {
        PayWayWebhookPayload payload = PayWayWebhookPayload.builder()
                .tranId("TX998877")
                .status("APPROVED")
                .amount(new BigDecimal("15.50"))
                .currency("USD")
                .apv("APV999")
                .build();

        PayWayTransaction existingTx = PayWayTransaction.builder()
                .tranId("TX998877")
                .merchantId("ec477511")
                .amount(new BigDecimal("15.50"))
                .status("PENDING")
                .build();

        when(transactionRepository.findByTranId("TX998877")).thenReturn(Optional.of(existingTx));

        Map<String, Object> result = payWayService.handlePaymentWebhook(payload);

        assertNotNull(result);
        assertEquals("00", result.get("status"));

        verify(transactionRepository).save(any(PayWayTransaction.class));
        assertEquals("APPROVED", existingTx.getStatus());
        assertEquals("APV999", existingTx.getApv());
    }
}
