package com.emenu.security;

import com.emenu.security.jwt.JWTAuthenticationFilter;
import com.emenu.security.jwt.JwtAccessDeniedHandler;
import com.emenu.security.jwt.JwtAuthEntryPoint;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthEntryPoint authEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;
    private final JWTAuthenticationFilter jwtAuthenticationFilter;

    @Value("${jwt.secret}")
    private String jwtSecret;

    // ─── Fail-fast JWT secret validation ─────────────────────────────────────

    @PostConstruct
    public void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.startsWith("${") || jwtSecret.length() < 64) {
            throw new IllegalStateException(
                "FATAL: JWT_SECRET is not configured or is too short (minimum 64 characters). " +
                "Set the JWT_SECRET environment variable before starting the application."
            );
        }
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .contentTypeOptions(contentType -> {})
                        .frameOptions(frame -> frame.deny())
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))
                        .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; frame-ancestors 'none'"))
                )
                .authorizeHttpRequests(auth -> auth
                        // ── Public endpoints ──
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/public/**").permitAll()
                        .requestMatchers("/api/v1/business-owners/register").permitAll()
                        .requestMatchers("/api/images/**").permitAll()
                        .requestMatchers("/api/v1/spaces/**").permitAll()

                        // ── Telegram webhook (HMAC-validated in controller) ──
                        .requestMatchers("/api/v1/telegram/webhook").permitAll()

                        // ── API documentation ──
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-resources/**", "/webjars/**").permitAll()
                        .requestMatchers("/swagger-config", "/api-docs/**").permitAll()

                        // ── WebSocket — JWT validated inside STOMP CONNECT interceptor ──
                        .requestMatchers("/ws/**").permitAll()

                        // ── Actuator ──
                        .requestMatchers("/actuator/health/**").permitAll()
                        .requestMatchers("/actuator/info").permitAll()
                        .requestMatchers("/actuator/prometheus").permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // allowedOriginPatterns("*") works with allowCredentials(true); setAllowedOrigins("*") does not
        config.addAllowedOriginPattern("*");
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "X-Request-ID", "X-Trace-ID", "Content-Disposition", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
