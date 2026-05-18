package com.emenu.shared.logging;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class RequestIdGenerator {

    public String generateRequestId() {
        return UUID.randomUUID().toString();
    }
}
