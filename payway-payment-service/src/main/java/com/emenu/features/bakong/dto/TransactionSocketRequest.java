package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSocketRequest {

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    @NotNull(message = "Interval seconds is required")
    @Min(value = 1, message = "Interval must be at least 1 second")
    @Max(value = 30, message = "Interval must not exceed 30 seconds")
    private Integer intervalSeconds;
}
