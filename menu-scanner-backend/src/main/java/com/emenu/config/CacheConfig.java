package com.emenu.config;

import com.emenu.shared.constants.CacheNames;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                buildCache(CacheNames.BUSINESS_SETTINGS,  500,  1,  TimeUnit.HOURS),
                buildCache(CacheNames.PRODUCTS,           2000, 30, TimeUnit.MINUTES),
                buildCache(CacheNames.CATEGORIES,         500,  1,  TimeUnit.HOURS),
                buildCache(CacheNames.MENUS,              200,  30, TimeUnit.MINUTES),
                buildCache(CacheNames.PROMOTIONS,         500,  15, TimeUnit.MINUTES),
                buildCache(CacheNames.ROLES,              200,  2,  TimeUnit.HOURS),
                buildCache(CacheNames.SUBSCRIPTION_PLANS, 200,  6,  TimeUnit.HOURS),
                buildCache(CacheNames.PROVINCES,          200,  24, TimeUnit.HOURS),
                buildCache(CacheNames.DISTRICTS,          500,  24, TimeUnit.HOURS),
                buildCache(CacheNames.COMMUNES,           1000, 24, TimeUnit.HOURS),
                buildCache(CacheNames.VILLAGES,           2000, 24, TimeUnit.HOURS),
                buildCache(CacheNames.BANNERS,            200,  30, TimeUnit.MINUTES),
                buildCache(CacheNames.BRANDS,             200,  1,  TimeUnit.HOURS),
                buildCache(CacheNames.DASHBOARD_SUMMARY,  1000, 60, TimeUnit.SECONDS),
                buildCache(CacheNames.DASHBOARD_STATS,    1000, 2,  TimeUnit.MINUTES)
        ));
        return manager;
    }

    private CaffeineCache buildCache(String name, int maxSize, long duration, TimeUnit unit) {
        return new CaffeineCache(name,
                Caffeine.newBuilder()
                        .maximumSize(maxSize)
                        .expireAfterWrite(duration, unit)
                        .recordStats()
                        .build());
    }
}
