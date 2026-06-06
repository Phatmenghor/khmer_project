package com.emenu.config;

import com.emenu.security.jwt.JWTGenerator;
import com.emenu.security.jwt.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.Optional;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JWTGenerator jwtGenerator;
    private final TokenBlacklistService tokenBlacklistService;

    @Value("${app.security.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins)   // explicit list — never wildcard
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) return message;

                // Only validate on CONNECT — subsequent frames use the established session principal
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        log.warn("[WS] CONNECT rejected — missing Authorization header");
                        throw new MessageDeliveryException("Authorization header is required for WebSocket connections");
                    }

                    String token = authHeader.substring(7);

                    if (tokenBlacklistService.isTokenBlacklisted(token)) {
                        log.warn("[WS] CONNECT rejected — blacklisted token");
                        throw new MessageDeliveryException("Token has been revoked");
                    }

                    Optional<Claims> claims = jwtGenerator.parseClaimsQuietly(token);
                    if (claims.isEmpty()) {
                        log.warn("[WS] CONNECT rejected — invalid or expired token");
                        throw new MessageDeliveryException("Invalid or expired JWT token");
                    }

                    String tokenType = claims.get().get("type", String.class);
                    if (!"access".equals(tokenType)) {
                        log.warn("[WS] CONNECT rejected — wrong token type: {}", tokenType);
                        throw new MessageDeliveryException("WebSocket requires an access token");
                    }

                    String subject = claims.get().getSubject();
                    accessor.setUser(new StompPrincipal(subject));
                    log.debug("[WS] CONNECT authenticated: subject={}", subject);
                }

                return message;
            }
        });
    }

    private record StompPrincipal(String name) implements Principal {
        @Override
        public String getName() {
            return name;
        }
    }
}
