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
public class PayWayTransactionResponse {

    private StatusInfo status;

    @JsonProperty("tran_id")
    private String tranId;

    @JsonProperty("apv")
    private String apv;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    private String currency;

    @JsonProperty("payment_status")
    private String paymentStatus;

    @JsonProperty("payment_option")
    private String paymentOption;

    @JsonProperty("pay_way")
    private String payWay;

    @JsonProperty("transaction_date")
    private String transactionDate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusInfo {
        private String code;
        private String message;
    }
}
