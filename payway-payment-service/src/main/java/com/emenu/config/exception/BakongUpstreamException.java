package com.emenu.config.exception;

import lombok.Getter;

@Getter
public class BakongUpstreamException extends RuntimeException {

    private final int statusCode;
    private final String responseBody;

    public BakongUpstreamException(String message, int statusCode, String responseBody) {
        super(message);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }

    public BakongUpstreamException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 500;
        this.responseBody = null;
    }
}
