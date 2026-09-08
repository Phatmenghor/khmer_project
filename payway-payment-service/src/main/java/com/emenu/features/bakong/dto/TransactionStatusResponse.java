package com.emenu.features.bakong.dto;

import com.emenu.features.bakong.enums.TransactionState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionStatusResponse {

    private TransactionState state;
    private boolean terminal;
    private BakongResponse transaction;

    public TransactionState state() { return getState(); }
    public boolean terminal() { return isTerminal(); }
    public BakongResponse transaction() { return getTransaction(); }
}
