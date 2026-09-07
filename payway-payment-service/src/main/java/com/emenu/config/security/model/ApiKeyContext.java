package com.emenu.config.security.model;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiKeyContext {

    public static final String REQUEST_ATTR = "API_KEY_CONTEXT";

    private final String projectCode;
    private final String apiKey;

    public static ApiKeyContext from(HttpServletRequest request) {
        return (ApiKeyContext) request.getAttribute(REQUEST_ATTR);
    }
}
