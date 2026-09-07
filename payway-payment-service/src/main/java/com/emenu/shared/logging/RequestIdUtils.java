package com.emenu.shared.logging;

import org.slf4j.MDC;

public final class RequestIdUtils {

    private RequestIdUtils() {}

    public static String getTraceId() {
        String id = MDC.get("traceId");
        return id != null ? id : "unknown";
    }
}
