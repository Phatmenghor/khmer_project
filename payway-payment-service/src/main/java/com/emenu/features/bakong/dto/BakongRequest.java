package com.emenu.features.bakong.dto;

import com.emenu.features.bakong.common.ValidBakongRequest;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Bakong KHQR QR Code Generation Payload")
public class BakongRequest {

    @NotNull(message = "currency is required")
    @Schema(description = "Currency of transaction (USD or KHR)", example = "USD", requiredMode = Schema.RequiredMode.REQUIRED)
    private KHQRCurrency currency;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be greater than 0")
    @Schema(description = "Payment amount", example = "5.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private Double amount;

    @Schema(description = "Merchant or store name", example = "eMenu Coffee & Bakery")
    private String merchantName;

    @Schema(description = "Merchant city location", example = "Phnom Penh")
    private String merchantCity;

    @Schema(description = "Bill or Invoice reference number", example = "INV-100201")
    private String billNumber;

    @Schema(description = "Store or branch name label", example = "Branch 1")
    private String storeLabel;

    @Schema(description = "POS terminal label", example = "POS-01")
    private String terminalLabel;

    @Schema(description = "Merchant contact mobile number", example = "012345678")
    private String mobileNumber;
}
