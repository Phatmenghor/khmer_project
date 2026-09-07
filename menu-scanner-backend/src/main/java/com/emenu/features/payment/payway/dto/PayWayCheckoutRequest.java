package com.emenu.features.payment.payway.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayWayCheckoutRequest {

    @NotBlank(message = "Transaction ID is required")
    @JsonProperty("tran_id")
    private String tranId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String items;

    private String firstname;

    private String lastname;

    private String email;

    private String phone;

    @Builder.Default
    private String type = "purchase";

    @JsonProperty("payment_option")
    @Builder.Default
    private String paymentOption = "abapay";

    @Builder.Default
    private String currency = "USD";

    @JsonProperty("return_url")
    private String returnUrl;

    @JsonProperty("continue_success_url")
    private String continueSuccessUrl;

    @JsonProperty("return_params")
    private String returnParams;

    @JsonProperty("subscription_id")
    private String subscriptionId;

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("business_id")
    private String businessId;
}
