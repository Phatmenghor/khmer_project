package com.emenu.shared.logging;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class RequestIdGenerator {

    public String generateRequestId() {
        return "REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
