package com.emenu.features.payment.payway.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayWayWebhookPayload {

    private String tranId;
    private String status;
    private BigDecimal amount;
    private String currency;

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("subscriptionId")
    private String subscriptionId;

    @JsonProperty("businessId")
    private String businessId;

    private String apv;
}
