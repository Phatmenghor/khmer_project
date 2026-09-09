package com.emenu.features.payway.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayWayCheckTransactionRequest {

    @NotBlank(message = "Transaction ID is required")
    @JsonProperty("tran_id")
    private String tranId;
}
