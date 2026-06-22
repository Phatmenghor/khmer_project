package com.emenu.config.security.model;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Lightweight context object resolved from an API key.
 * Placed as a request attribute so controllers/services can retrieve it
 * without needing any extra headers or form fields.
 */
@Getter
@AllArgsConstructor
public class ApiKeyContext {
    private final String projectCode;
    /**
     * The path segment stored on the key record.
     * e.g. "b/abc-123", "owner", "customer", or null (key-level scope, files go under projectCode/date/)
     */
    private final String path;

    public static final String REQUEST_ATTR = "API_KEY_CONTEXT";

    public static ApiKeyContext from(HttpServletRequest request) {
        return (ApiKeyContext) request.getAttribute(REQUEST_ATTR);
    }
}
