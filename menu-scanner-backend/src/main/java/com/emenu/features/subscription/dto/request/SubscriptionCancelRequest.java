package com.emenu.features.subscription.dto.request;

import com.emenu.config.BigDecimalDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SubscriptionCancelRequest {
    private String reason;
    private String notes;

    // Refund amount to be processed when cancelling
    @JsonDeserialize(using = BigDecimalDeserializer.class)
    private BigDecimal refundAmount;
    private String refundNotes;
    
    // Helper method
    public boolean hasRefundAmount() {
        return refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) >= 0;
    }
}