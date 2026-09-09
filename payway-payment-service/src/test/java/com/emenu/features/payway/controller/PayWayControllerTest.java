package com.emenu.features.payway.controller;

import com.emenu.config.security.ApiKeyAuthFilter;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import com.emenu.features.apikey.service.ApiKeyService;
import com.emenu.features.payway.dto.PayWayCheckTransactionRequest;
import com.emenu.features.payway.dto.PayWayCheckoutRequest;
import com.emenu.features.payway.dto.PayWayCheckoutResponse;
import com.emenu.features.payway.dto.PayWayTransactionResponse;
import com.emenu.features.payway.dto.PayWayWebhookPayload;
import com.emenu.features.payway.service.PayWayService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PayWayController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class PayWayControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PayWayService payWayService;

    @MockBean
    private ApiKeyAuthFilter apiKeyAuthFilter;

    @MockBean
    private ApiKeyService apiKeyService;

    @MockBean
    private ApiKeyRepository apiKeyRepository;

    @Test
    @DisplayName("POST /api/v1/payments/payway/checkout should return 200 OK")
    void testCreateCheckoutEndpoint() throws Exception {
        PayWayCheckoutRequest request = PayWayCheckoutRequest.builder()
                .tranId("TX112233")
                .amount(new BigDecimal("20.00"))
                .build();

        PayWayCheckoutResponse mockResponse = PayWayCheckoutResponse.builder()
                .status("0")
                .merchantId("ec477511")
                .tranId("TX112233")
                .hash("MOCK_HASH")
                .checkoutUrl("https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase")
                .build();

        when(payWayService.createCheckout(any(PayWayCheckoutRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/payments/payway/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tran_id").value("TX112233"))
                .andExpect(jsonPath("$.merchant_id").value("ec477511"));
    }

    @Test
    @DisplayName("POST /api/v1/payments/payway/check-transaction should return 200 OK")
    void testCheckTransactionEndpoint() throws Exception {
        PayWayCheckTransactionRequest request = PayWayCheckTransactionRequest.builder()
                .tranId("TX112233")
                .build();

        PayWayTransactionResponse mockResponse = PayWayTransactionResponse.builder()
                .status(new PayWayTransactionResponse.StatusInfo("00", "APPROVED"))
                .tranId("TX112233")
                .paymentStatus("APPROVED")
                .build();

        when(payWayService.checkTransactionStatus(any(PayWayCheckTransactionRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/payments/payway/check-transaction")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tran_id").value("TX112233"))
                .andExpect(jsonPath("$.payment_status").value("APPROVED"));
    }

    @Test
    @DisplayName("POST /api/v1/payments/payway/webhook should return 200 OK")
    void testWebhookEndpoint() throws Exception {
        PayWayWebhookPayload payload = PayWayWebhookPayload.builder()
                .tranId("TX112233")
                .status("APPROVED")
                .build();

        when(payWayService.handlePaymentWebhook(any(PayWayWebhookPayload.class)))
                .thenReturn(Map.of("status", "00", "message", "Webhook processed successfully"));

        mockMvc.perform(post("/api/v1/payments/payway/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("00"));
    }
}
