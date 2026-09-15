package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreamCheckTransactionRequest {

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    @Min(value = 1, message = "Interval seconds must be at least 1")
    @Max(value = 30, message = "Interval seconds cannot exceed 30")
    private Integer intervalSeconds;
}
