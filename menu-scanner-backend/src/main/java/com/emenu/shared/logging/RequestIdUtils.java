package com.emenu.shared.logging;

import lombok.experimental.UtilityClass;
import org.slf4j.MDC;

@UtilityClass
public class RequestIdUtils {

    private static final String REQUEST_ID_KEY = "requestId";

    public String getCurrentRequestId() {
        String requestId = MDC.get(REQUEST_ID_KEY);
        return requestId != null ? requestId : "UNKNOWN";
    }

    public void setRequestId(String requestId) {
        MDC.put(REQUEST_ID_KEY, requestId);
    }

    public void clearRequestId() {
        MDC.remove(REQUEST_ID_KEY);
    }
}
