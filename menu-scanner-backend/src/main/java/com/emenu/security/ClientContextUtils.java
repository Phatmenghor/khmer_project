package com.emenu.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@Slf4j
public class ClientContextUtils {

    private static final String UNKNOWN_IP = "Unknown";
    private static final String UNKNOWN_DEVICE = "Unknown";
    private static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String HEADER_X_REAL_IP = "X-Real-IP";
    private static final String HEADER_USER_AGENT = "User-Agent";

    public HttpServletRequest getHttpServletRequest() {
        try {
            ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (requestAttributes != null) {
                return requestAttributes.getRequest();
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve HTTP request: error={}", e.getMessage());
        }
        return null;
    }

    public String getClientIpAddress() {
        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            String xForwardedFor = httpRequest.getHeader(HEADER_X_FORWARDED_FOR);
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }

            String xRealIp = httpRequest.getHeader(HEADER_X_REAL_IP);
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }

            return httpRequest.getRemoteAddr();
        }
        return UNKNOWN_IP;
    }

    public String getDeviceInfo() {
        HttpServletRequest httpRequest = getHttpServletRequest();
        if (httpRequest != null) {
            String userAgent = httpRequest.getHeader(HEADER_USER_AGENT);
            if (userAgent != null && !userAgent.isEmpty()) {
                return userAgent;
            }
        }
        return UNKNOWN_DEVICE;
    }
}
