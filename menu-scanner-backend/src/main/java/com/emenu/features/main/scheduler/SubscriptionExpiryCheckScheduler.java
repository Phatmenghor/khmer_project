package com.emenu.features.main.scheduler;

import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionExpiryCheckScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final TelegramNotificationService telegramNotificationService;

    @Value("${app.subscription.expiry-soon-days:7}")
    private int expirySoonDays;

    /**
     * Runs daily at 02:00 to check for subscriptions expiring soon (within 7 days)
     * and send Telegram notifications to the admin group.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void checkAndNotifyExpiringSubscriptions() {
        log.info("[Scheduler] Checking for subscriptions expiring soon...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryThreshold = now.plusDays(expirySoonDays);

        List<Subscription> expiringSubscriptions = subscriptionRepository
                .findExpiringSubscriptions(now, expiryThreshold);

        if (expiringSubscriptions.isEmpty()) {
            log.info("[Scheduler] No subscriptions expiring soon. Check completed.");
            return;
        }

        log.info("[Scheduler] Found {} subscriptions expiring soon.", expiringSubscriptions.size());

        expiringSubscriptions.forEach(subscription -> {
            try {
                long daysRemaining = ChronoUnit.DAYS
                        .between(now.toLocalDate(), subscription.getEndDate().toLocalDate());

                String businessName = subscription.getBusiness() != null
                        ? subscription.getBusiness().getName()
                        : "Unknown Business";

                String expiryDate = subscription.getEndDate().toLocalDate().toString();

                telegramNotificationService.notifySubscriptionExpiringSoon(
                        subscription.getBusinessId(),
                        businessName,
                        daysRemaining,
                        expiryDate
                );

                log.info("[Scheduler] Notification sent for business: {}, days remaining: {}",
                        businessName, daysRemaining);
            } catch (Exception e) {
                log.error("[Scheduler] Error sending notification for subscription: {}",
                        subscription.getId(), e);
            }
        });

        log.info("[Scheduler] Subscription expiry check completed. Notifications sent: {}",
                expiringSubscriptions.size());
    }
}
