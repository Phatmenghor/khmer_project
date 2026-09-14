package com.emenu.config;

import com.emenu.constant.BakongApiConstants;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "bakong")
public class BakongProperties {

    /**
     * Bakong API Base URL
     */
    private String apiUrl = BakongApiConstants.DEFAULT_BAKONG_API_URL;

    /**
     * Bakong Account ID (e.g. phat_menghor@bkrt)
     */
    private String accountId = BakongApiConstants.DEFAULT_DEVELOPER_ACCOUNT_ID;

    /**
     * Developer registration email for NBC Bakong API
     */
    private String email = BakongApiConstants.DEFAULT_DEVELOPER_EMAIL;

    /**
     * Enable Bakong service features
     */
    private boolean enabled = true;

    /**
     * Official Bakong Developer Open API daily rate limit (100 requests / day)
     */
    private int dailyRateLimit = BakongApiConstants.DEFAULT_DAILY_RATE_LIMIT;

    public String getApiUrl() {
        if (apiUrl == null || apiUrl.isBlank()) {
            return BakongApiConstants.DEFAULT_BAKONG_API_URL;
        }
        return apiUrl.replaceAll("/+$", "");
    }

    public String getAccountId() {
        if (accountId == null || accountId.isBlank()) {
            return BakongApiConstants.DEFAULT_DEVELOPER_ACCOUNT_ID;
        }
        return accountId.trim();
    }

    public String getEmail() {
        if (email == null || email.isBlank()) {
            return BakongApiConstants.DEFAULT_DEVELOPER_EMAIL;
        }
        return email.trim();
    }
}
