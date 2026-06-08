package com.emenu.shared.logging;

import lombok.experimental.UtilityClass;
import org.slf4j.MDC;

@UtilityClass
public class RequestIdUtils {

    private static final String TRACE_ID_KEY = "traceId";

    public String getCurrentTraceId() {
        String traceId = MDC.get(TRACE_ID_KEY);
        return traceId != null ? traceId : "UNKNOWN";
    }

    public void setTraceId(String traceId) {
        MDC.put(TRACE_ID_KEY, traceId);
    }

    public void clearTraceId() {
        MDC.remove(TRACE_ID_KEY);
    }
}
