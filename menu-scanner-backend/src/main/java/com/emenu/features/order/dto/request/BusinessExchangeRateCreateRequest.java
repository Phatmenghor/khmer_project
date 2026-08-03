package com.emenu.features.order.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BusinessExchangeRateCreateRequest {

    private UUID businessId;
    
    @NotNull(message = "USD to KHR exchange rate is required")
    @DecimalMin(value = "1000.0", message = "USD to KHR rate must be at least 1000")
    @DecimalMax(value = "10000.0", message = "USD to KHR rate cannot exceed 10000")
    private Double usdToKhrRate;
    
    private String notes;
    private String status;
}