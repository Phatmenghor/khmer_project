package com.emenu.features.bakong.dto;

import com.emenu.features.bakong.enums.TransactionState;

public record TransactionStatusResponse(
        TransactionState state,
        boolean terminal,
        BakongResponse transaction
) {
}
