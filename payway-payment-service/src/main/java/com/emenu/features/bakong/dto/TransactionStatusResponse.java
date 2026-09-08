package com.emenu.features.bakong.dto;

import com.emenu.features.bakong.enums.TransactionState;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TransactionStatusResponse(
        TransactionState state,
        boolean terminal,
        BakongResponse transaction
) {
}
