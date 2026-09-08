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

    /**
     * Optional expiration duration in minutes (e.g., 15, 30, 60).
     * Set to -1 or 0 for Keep-Alive (Never Expire).
     * Default: 15 minutes.
     */
    private Integer expirationMinutes;

    /**
     * Optional explicit expiration timestamp in Epoch Milliseconds.
     * Set to -1 or 0 for Keep-Alive (Never Expire).
     */
    private Long expirationTimestamp;
}
