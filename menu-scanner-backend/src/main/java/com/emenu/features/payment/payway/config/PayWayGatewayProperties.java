package com.emenu.features.payment.payway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payway-service")
public class PayWayGatewayProperties {

    private String serviceUrl = "http://localhost:7073";
    private String apiKey = "sk_payway_default_secret_key_123456789";
}
