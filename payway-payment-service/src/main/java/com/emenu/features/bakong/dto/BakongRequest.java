package com.emenu.features.bakong.dto;

import com.emenu.features.bakong.common.ValidBakongRequest;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidBakongRequest
public class BakongRequest {

    @NotNull(message = "currency is required")
    private KHQRCurrency currency;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be greater than 0")
    private Double amount;

    private String merchantName;
    private String merchantCity;
    private String billNumber;
    private String storeLabel;
    private String terminalLabel;
    private String mobileNumber;
}
