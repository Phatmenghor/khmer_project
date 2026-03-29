package com.emenu.features.order.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.features.order.models.BusinessExchangeRate;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessExchangeRateResponse extends BaseAuditResponse {

    private UUID businessId;
    private String businessName;

    // Required: USD to KHR
    private Double usdToKhrRate;

    // Optional currencies
    private Double usdToCnyRate;
    private Double usdToVndRate;

    private Status status;
    private String notes;
}