package com.emenu.features.bakong.mapper;

import com.emenu.features.bakong.enums.TransactionState;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import org.springframework.stereotype.Component;

@Component
public class TransactionStatusMapper {

    public TransactionStatusResponse toStatus(BakongResponse response) {
        TransactionState state = toState(response);
        return new TransactionStatusResponse(
                state,
                state == TransactionState.PAID || state == TransactionState.FAILED,
                response
        );
    }

    public TransactionStatusResponse toStreamingStatus(BakongResponse response, long attemptIndex) {
        TransactionState state = toStreamingState(response, attemptIndex);
        return new TransactionStatusResponse(
                state,
                state == TransactionState.PAID || state == TransactionState.FAILED,
                response
        );
    }

    private TransactionState toState(BakongResponse response) {
        if (response == null) {
            return TransactionState.FAILED;
        }

        if (response.isSuccess()) {
            return TransactionState.PAID;
        }

        if (response.getResponseCode() == 1) {
            return TransactionState.WAITING;
        }

        return TransactionState.FAILED;
    }

    private TransactionState toStreamingState(BakongResponse response, long attemptIndex) {
        if (response == null) {
            return TransactionState.FAILED;
        }

        if (response.isSuccess()) {
            return TransactionState.PAID;
        }

        if (response.getResponseCode() == 1) {
            return attemptIndex <= 0 ? TransactionState.NOT_SCANNED : TransactionState.WAITING_FOR_PAYMENT;
        }

        return TransactionState.FAILED;
    }
}
