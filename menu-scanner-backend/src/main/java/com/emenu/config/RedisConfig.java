package com.emenu.config;

import com.emenu.shared.constants.CacheNames;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@Slf4j
@ConditionalOnProperty(name = "app.cache.provider", havingValue = "redis")
public class RedisConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.data.redis.database:0}")
    private int redisDatabase;

    @Value("${spring.data.redis.timeout:2000}")
    private long commandTimeout;

    // ─── Connection Factory ─────────────────────────────────────────────────────

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(redisHost, redisPort);
        config.setDatabase(redisDatabase);
        if (redisPassword != null && !redisPassword.isBlank()) {
            config.setPassword(redisPassword);
        }

        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                .commandTimeout(Duration.ofMillis(commandTimeout))
                .build();

        log.info("Connecting to Redis: {}:{} db={}", redisHost, redisPort, redisDatabase);
        return new LettuceConnectionFactory(config, clientConfig);
    }

    // ─── Redis Template ─────────────────────────────────────────────────────────

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper()));
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper()));
        template.afterPropertiesSet();
        return template;
    }

    // ─── Cache Manager (Redis) ──────────────────────────────────────────────────

    @Bean
    @Primary
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(redisObjectMapper());

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigs = buildCacheConfigurations(defaultConfig);

        log.info("Redis CacheManager initialized with {} named caches", cacheConfigs.size());
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }

    private Map<String, RedisCacheConfiguration> buildCacheConfigurations(RedisCacheConfiguration base) {
        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
        // ── Frequently-read, rarely-changing data ──
        configs.put(CacheNames.BUSINESS_SETTINGS, base.entryTtl(Duration.ofHours(2)));
        configs.put(CacheNames.ROLES,             base.entryTtl(Duration.ofHours(4)));
        configs.put(CacheNames.SUBSCRIPTION_PLANS,base.entryTtl(Duration.ofHours(6)));
        configs.put(CacheNames.PROVINCES,         base.entryTtl(Duration.ofHours(24)));
        configs.put(CacheNames.DISTRICTS,         base.entryTtl(Duration.ofHours(24)));
        configs.put(CacheNames.COMMUNES,          base.entryTtl(Duration.ofHours(24)));
        configs.put(CacheNames.VILLAGES,          base.entryTtl(Duration.ofHours(24)));
        // ── Moderate-frequency reads ──
        configs.put(CacheNames.CATEGORIES,        base.entryTtl(Duration.ofMinutes(30)));
        configs.put(CacheNames.PRODUCTS,          base.entryTtl(Duration.ofMinutes(20)));
        configs.put(CacheNames.MENUS,             base.entryTtl(Duration.ofMinutes(20)));
        configs.put(CacheNames.PROMOTIONS,        base.entryTtl(Duration.ofMinutes(10)));
        configs.put(CacheNames.BANNERS,           base.entryTtl(Duration.ofMinutes(30)));
        configs.put(CacheNames.BRANDS,            base.entryTtl(Duration.ofHours(1)));
        return configs;
    }

    private ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Restrict polymorphic deserialization to trusted packages only (prevents RCE)
        mapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder()
                        .allowIfSubType("com.emenu.")
                        .allowIfSubType("java.util.")
                        .allowIfSubType("java.lang.")
                        .allowIfSubType("java.time.")
                        .allowIfSubType("java.math.")
                        .build(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }
}
