package com.emenu.config.bakong;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bakong")
@Getter
@Setter
public class BakongProperties {

    private String serviceUrl;
    private String apiKey;
}
