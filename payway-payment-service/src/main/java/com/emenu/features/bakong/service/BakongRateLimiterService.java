package com.emenu.features.bakong.service;

import com.emenu.features.bakong.dto.BakongMonitoringStatusResponse.DailyQuotaInfo;
import com.emenu.features.bakong.model.BakongConfig;

public interface BakongRateLimiterService {

    /**
     * Selects an active developer configuration with available daily quota,
     * increments its daily request count, and returns the selected configuration.
     * Switches/fails over to the next developer account if one account reaches its limit.
     */
    BakongConfig selectAndIncrementActiveQuota(String endpoint);

    /**
     * Legacy helper method to check and increment daily quota on the active developer configuration.
     */
    void checkAndIncrementDailyQuota(String endpoint);

    /**
     * Returns today's total executed Bakong API request count across developer accounts.
     */
    int getTodayRequestCount();

    /**
     * Returns the remaining Bakong API requests allowed for today across developer accounts.
     */
    int getRemainingQuota();

    /**
     * Returns the detailed daily quota monitoring info with multi-account breakdown.
     */
    DailyQuotaInfo getQuotaInfo();
}

