package com.emenu.config.exception;

public class TransactionNotFoundException extends RuntimeException {

    public TransactionNotFoundException(String tranId) {
        super("Transaction not found for ID: " + tranId);
    }
}
