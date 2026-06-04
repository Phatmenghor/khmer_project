package com.emenu.config;

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

    // ─── Cache name constants ───────────────────────────────────────────────────
    public static final String CACHE_BUSINESS_SETTINGS = "businessSettings";
    public static final String CACHE_PRODUCTS          = "products";
    public static final String CACHE_CATEGORIES        = "categories";
    public static final String CACHE_MENUS             = "menus";
    public static final String CACHE_PROMOTIONS        = "promotions";
    public static final String CACHE_ROLES             = "roles";
    public static final String CACHE_USERS             = "users";
    public static final String CACHE_SUBSCRIPTIONS     = "subscriptions";
    public static final String CACHE_TOKEN_BLACKLIST   = "tokenBlacklist";

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                buildCache(CACHE_BUSINESS_SETTINGS, 500,  1, TimeUnit.HOURS),
                buildCache(CACHE_PRODUCTS,          2000, 30, TimeUnit.MINUTES),
                buildCache(CACHE_CATEGORIES,        500,  1, TimeUnit.HOURS),
                buildCache(CACHE_MENUS,             200,  30, TimeUnit.MINUTES),
                buildCache(CACHE_PROMOTIONS,        500,  15, TimeUnit.MINUTES),
                buildCache(CACHE_ROLES,             200,  2, TimeUnit.HOURS),
                buildCache(CACHE_USERS,             1000, 15, TimeUnit.MINUTES),
                buildCache(CACHE_SUBSCRIPTIONS,     500,  30, TimeUnit.MINUTES),
                buildCache(CACHE_TOKEN_BLACKLIST,   5000, 24, TimeUnit.HOURS)
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
