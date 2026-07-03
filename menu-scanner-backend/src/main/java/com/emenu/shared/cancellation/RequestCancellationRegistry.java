package com.emenu.shared.cancellation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RequestCancellationRegistry {

    // Maps sessionId_subscriptionId -> importId
    private final Map<String, String> activeSubscriptions = new ConcurrentHashMap<>();
    
    // Set of cancelled importIds
    private final Set<String> cancelledImports = ConcurrentHashMap.newKeySet();

    public void registerImport(String importId) {
        if (importId != null) {
            log.info("Registered active import for tracking: {}", importId);
        }
    }

    public boolean isCancelled(String importId) {
        if (importId == null) {
            return false;
        }
        return cancelledImports.contains(importId);
    }

    public void checkCancelled(String importId) {
        if (isCancelled(importId)) {
            log.warn("Import {} detected as cancelled due to client disconnect.", importId);
            throw new CancellationException("Import cancelled due to client disconnection");
        }
    }

    @EventListener
    public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headers.getDestination();
        if (destination != null && destination.startsWith("/topic/import-progress/")) {
            String importId = destination.substring("/topic/import-progress/".length());
            String sessionId = headers.getSessionId();
            String subscriptionId = headers.getSubscriptionId();
            if (sessionId != null && subscriptionId != null) {
                String key = sessionId + "_" + subscriptionId;
                activeSubscriptions.put(key, importId);
                log.info("WebSocket subscription registered: sessionId={}, subscriptionId={}, importId={}", 
                        sessionId, subscriptionId, importId);
            }
        }
    }

    @EventListener
    public void handleSessionUnsubscribeEvent(SessionUnsubscribeEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        String subscriptionId = headers.getSubscriptionId();
        if (sessionId != null && subscriptionId != null) {
            String key = sessionId + "_" + subscriptionId;
            String importId = activeSubscriptions.remove(key);
            if (importId != null) {
                cancelledImports.add(importId);
                log.warn("WebSocket client unsubscribed from progress updates. Marking import {} as cancelled.", importId);
            }
        }
    }

    @EventListener
    public void handleSessionDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        if (sessionId != null) {
            // Find all subscriptions associated with this sessionId
            activeSubscriptions.forEach((key, importId) -> {
                if (key.startsWith(sessionId + "_")) {
                    cancelledImports.add(importId);
                    log.warn("WebSocket client disconnected. Marking import {} as cancelled.", importId);
                }
            });
            activeSubscriptions.keySet().removeIf(key -> key.startsWith(sessionId + "_"));
        }
    }
    
    public void cleanUp(String importId) {
        if (importId != null) {
            cancelledImports.remove(importId);
            activeSubscriptions.values().removeIf(id -> id.equals(importId));
            log.info("Cleaned up registry for importId: {}", importId);
        }
    }
}
