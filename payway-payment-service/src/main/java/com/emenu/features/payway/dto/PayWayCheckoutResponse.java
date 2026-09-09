package com.emenu.features.payway.dto;

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
public class PayWayCheckoutResponse {

    private String status;

    private String description;

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("tran_id")
    private String tranId;

    @JsonProperty("req_time")
    private String reqTime;

    private BigDecimal amount;

    private String currency;

    @JsonProperty("payment_option")
    private String paymentOption;

    private String hash;

    @JsonProperty("checkout_url")
    private String checkoutUrl;

    @JsonProperty("qr_string")
    private String qrString;

    @JsonProperty("qr_image")
    private String qrImage;

    @JsonProperty("abapay_deeplink")
    private String abapayDeeplink;
}
