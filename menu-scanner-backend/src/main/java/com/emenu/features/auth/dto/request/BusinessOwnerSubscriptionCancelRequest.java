package com.emenu.features.auth.dto.request;

import com.emenu.config.BigDecimalDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessOwnerSubscriptionCancelRequest {

    private String reason;
    private String notes;

    @JsonDeserialize(using = BigDecimalDeserializer.class)
    private BigDecimal refundAmount;
    private String refundMethod;
    private String refundReference;
    
    public boolean hasRefundAmount() {
        return refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) >= 0;
    }
}