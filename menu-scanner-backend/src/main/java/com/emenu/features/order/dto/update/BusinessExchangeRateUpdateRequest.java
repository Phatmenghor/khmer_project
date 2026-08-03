package com.emenu.features.order.dto.update;

import com.emenu.features.order.models.BusinessExchangeRate;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class BusinessExchangeRateUpdateRequest {

    @DecimalMin(value = "1000.0", message = "USD to KHR rate must be at least 1000")
    @DecimalMax(value = "10000.0", message = "USD to KHR rate cannot exceed 10000")
    private Double usdToKhrRate;

    // Status: ACTIVE or INACTIVE
    // When setting to ACTIVE, other active rates for same business are automatically deactivated
    private BusinessExchangeRate.ExchangeRateStatus status;

    private String notes;
}