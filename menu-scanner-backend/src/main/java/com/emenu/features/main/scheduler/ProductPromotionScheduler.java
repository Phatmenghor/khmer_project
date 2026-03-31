package com.emenu.features.main.scheduler;

import com.emenu.features.main.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductPromotionScheduler {

    private final ProductService productService;

    /**
     * Runs every day at 00:05 to clear display fields for products
     * whose promotions have expired (toDate < today).
     */
    @Scheduled(cron = "0 5 0 * * *")
    public void clearExpiredPromotions() {

        int[] result = productService.syncExpiredPromotions();

                result[0], result[1], result[0] + result[1]);
    }

    /**
     * Runs every day at 00:10 to activate display fields for products
     * whose promotions have just started (fromDate <= today and not yet active).
     */
    @Scheduled(cron = "0 10 0 * * *")
    public void activateStartedPromotions() {

        int[] result = productService.syncStartedPromotions();

                result[0], result[1], result[0] + result[1]);
    }
}
