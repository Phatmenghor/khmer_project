package com.emenu.features.bakong.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "bakong")
public class BakongProperties {

    /**
     * Bakong API Base URL (defaults to official NBC Bakong endpoint)
     */
    private String apiUrl = "https://api-bakong.nbc.gov.kh";

    /**
     * Bakong Account ID (e.g. phat_menghor@bkrt)
     */
    private String accountId = "phat_menghor@bkrt";

    /**
     * Developer registration email for NBC Bakong API
     */
    private String email = "phatmenghor19@gmail.com";

    /**
     * Enable Bakong service features
     */
    private boolean enabled = true;

    public String getApiUrl() {
        if (apiUrl == null || apiUrl.isBlank()) {
            return "https://api-bakong.nbc.gov.kh";
        }
        return apiUrl.replaceAll("/+$", "");
    }

    public String getAccountId() {
        if (accountId == null || accountId.isBlank()) {
            return "phat_menghor@bkrt";
        }
        return accountId.trim();
    }

    public String getEmail() {
        if (email == null || email.isBlank()) {
            return "phatmenghor19@gmail.com";
        }
        return email.trim();
    }
}
