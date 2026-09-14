package com.emenu.features.bakong.service.impl;

import com.emenu.config.exception.BakongUpstreamException;
import com.emenu.features.bakong.notifier.TelegramNotifier;
import com.emenu.config.BakongProperties;
import com.emenu.features.bakong.dto.BakongMonitoringStatusResponse.AccountQuotaDetail;
import com.emenu.features.bakong.dto.BakongMonitoringStatusResponse.DailyQuotaInfo;
import com.emenu.features.bakong.model.BakongConfig;
import com.emenu.features.bakong.model.BakongDailyQuotaLog;
import com.emenu.features.bakong.repository.BakongConfigRepository;
import com.emenu.features.bakong.repository.BakongDailyQuotaRepository;
import com.emenu.features.bakong.service.BakongRateLimiterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongRateLimiterServiceImpl implements BakongRateLimiterService {

    private final BakongDailyQuotaRepository quotaRepository;
    private final BakongProperties bakongProperties;
    private final BakongConfigRepository bakongConfigRepository;
    private final TelegramNotifier telegramNotifier;

    @Override
    @Transactional
    public synchronized BakongConfig selectAndIncrementActiveQuota(String endpoint) {
        LocalDate today = getTodayDate();
        List<BakongConfig> configs = getEnabledConfigs();

        for (BakongConfig config : configs) {
            String email = config.getEmail();
            int maxLimit = config.getDailyRateLimit() > 0 ? config.getDailyRateLimit() : 100;

            BakongDailyQuotaLog quotaLog = quotaRepository.findByQuotaDateAndEmail(today, email)
                    .orElseGet(() -> BakongDailyQuotaLog.builder()
                            .quotaDate(today)
                            .email(email)
                            .requestCount(0)
                            .maxLimit(maxLimit)
                            .lastEndpoint(endpoint)
                            .build());

            int currentCount = quotaLog.getRequestCount();

            if (currentCount < maxLimit) {
                int newCount = currentCount + 1;
                quotaLog.setRequestCount(newCount);
                quotaLog.setMaxLimit(maxLimit);
                quotaLog.setLastEndpoint(endpoint);
                quotaRepository.save(quotaLog);

                int remaining = maxLimit - newCount;
                log.info("[BAKONG API QUOTA] Active developer account config={} email={} count: {}/{} (Remaining: {}) date={} endpoint={}",
                        config.getConfigName(), email, newCount, maxLimit, remaining, today, endpoint);

                if (newCount == (int) (maxLimit * 0.8)) {
                    log.warn("[BAKONG API QUOTA WARNING] Developer account email={} reached 80% ({}/{} used)", email, newCount, maxLimit);
                } else if (newCount == (int) (maxLimit * 0.9)) {
                    log.warn("[BAKONG API QUOTA CRITICAL] Developer account email={} reached 90% ({}/{} used)", email, newCount, maxLimit);
                    telegramNotifier.notifyIssue(
                            "Bakong Daily API Quota Warning (90%) for " + email,
                            endpoint,
                            Map.of("email", email, "date", today.toString(), "requestCount", newCount, "maxLimit", maxLimit),
                            null
                    );
                }

                return config;
            }
        }

        // All developer accounts have reached their daily limit
        String firstEmail = !configs.isEmpty() ? configs.get(0).getEmail() : bakongProperties.getEmail();
        log.error("[BAKONG API ALL QUOTA EXCEEDED] All {} registered developer accounts have reached their daily limit for date={}. Blocked request to endpoint={}",
                configs.size(), today, endpoint);

        telegramNotifier.notifyIssue(
                "Bakong Daily API Quota Limit Reached on ALL Developer Accounts",
                endpoint,
                Map.of("date", today.toString(), "accountCount", configs.size()),
                new RuntimeException("Daily Bakong API quota limit reached on all developer accounts")
        );

        throw new BakongUpstreamException(
                "All registered Bakong API developer accounts have reached their daily quota limit for today (" + today + "). The limit resets daily at midnight.",
                429,
                "{\"responseCode\":429,\"responseMessage\":\"All daily Bakong API developer account quotas reached\",\"errorCode\":429}"
        );
    }

    @Override
    @Transactional
    public synchronized void checkAndIncrementDailyQuota(String endpoint) {
        selectAndIncrementActiveQuota(endpoint);
    }

    @Override
    @Transactional(readOnly = true)
    public synchronized int getTodayRequestCount() {
        LocalDate today = getTodayDate();
        List<BakongConfig> configs = getEnabledConfigs();
        int totalUsed = 0;
        for (BakongConfig cfg : configs) {
            totalUsed += quotaRepository.findByQuotaDateAndEmail(today, cfg.getEmail())
                    .map(BakongDailyQuotaLog::getRequestCount)
                    .orElse(0);
        }
        return totalUsed;
    }

    @Override
    @Transactional(readOnly = true)
    public synchronized int getRemainingQuota() {
        LocalDate today = getTodayDate();
        List<BakongConfig> configs = getEnabledConfigs();
        int totalRemaining = 0;
        for (BakongConfig cfg : configs) {
            int used = quotaRepository.findByQuotaDateAndEmail(today, cfg.getEmail())
                    .map(BakongDailyQuotaLog::getRequestCount)
                    .orElse(0);
            int maxLimit = cfg.getDailyRateLimit() > 0 ? cfg.getDailyRateLimit() : 100;
            totalRemaining += Math.max(0, maxLimit - used);
        }
        return totalRemaining;
    }

    @Override
    @Transactional(readOnly = true)
    public synchronized DailyQuotaInfo getQuotaInfo() {
        LocalDate today = getTodayDate();
        List<BakongConfig> configs = getEnabledConfigs();

        List<AccountQuotaDetail> details = new ArrayList<>();
        int totalUsed = 0;
        int totalMax = 0;
        String activeEmail = null;

        for (BakongConfig cfg : configs) {
            String email = cfg.getEmail();
            int maxLimit = cfg.getDailyRateLimit() > 0 ? cfg.getDailyRateLimit() : 100;
            int used = quotaRepository.findByQuotaDateAndEmail(today, email)
                    .map(BakongDailyQuotaLog::getRequestCount)
                    .orElse(0);

            int remaining = Math.max(0, maxLimit - used);
            double percentage = (double) used / maxLimit * 100.0;
            boolean limitReached = used >= maxLimit;
            boolean isActive = false;

            if (activeEmail == null && !limitReached) {
                activeEmail = email;
                isActive = true;
            }

            totalUsed += used;
            totalMax += maxLimit;

            details.add(AccountQuotaDetail.builder()
                    .configName(cfg.getConfigName())
                    .email(email)
                    .usedCount(used)
                    .maxLimit(maxLimit)
                    .remainingQuota(remaining)
                    .usagePercentage(Math.round(percentage * 10.0) / 10.0)
                    .active(isActive)
                    .limitReached(limitReached)
                    .build());
        }

        if (activeEmail == null && !configs.isEmpty()) {
            activeEmail = configs.get(0).getEmail();
        }

        int totalRemaining = Math.max(0, totalMax - totalUsed);
        double totalPercentage = totalMax > 0 ? ((double) totalUsed / totalMax * 100.0) : 0.0;

        return DailyQuotaInfo.builder()
                .activeEmail(activeEmail)
                .email(activeEmail)
                .date(today.toString())
                .usedCount(totalUsed)
                .maxLimit(totalMax)
                .remainingQuota(totalRemaining)
                .usagePercentage(Math.round(totalPercentage * 10.0) / 10.0)
                .resetTimezone("Midnight (Asia/Phnom_Penh)")
                .accounts(details)
                .build();
    }

    private List<BakongConfig> getEnabledConfigs() {
        List<BakongConfig> configs = bakongConfigRepository.findAllByEnabledTrue();
        if (configs == null || configs.isEmpty()) {
            configs = List.of(BakongConfig.builder()
                    .configName("DEFAULT")
                    .apiUrl(bakongProperties.getApiUrl())
                    .email(bakongProperties.getEmail())
                    .dailyRateLimit(bakongProperties.getDailyRateLimit() > 0 ? bakongProperties.getDailyRateLimit() : 100)
                    .enabled(true)
                    .build());
        }
        return configs;
    }

    private LocalDate getTodayDate() {
        return LocalDate.now();
    }
}


