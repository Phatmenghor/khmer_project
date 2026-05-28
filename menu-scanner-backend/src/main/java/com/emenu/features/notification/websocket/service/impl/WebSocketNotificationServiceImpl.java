package com.emenu.features.notification.websocket.service.impl;

import com.emenu.features.notification.websocket.dto.WebSocketEvent;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.features.order.models.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationServiceImpl implements WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Async("taskExecutor")
    public void notifyNewOrder(Order order) {
        if (order.getBusinessId() == null) return;
        String businessId = order.getBusinessId().toString();
        WebSocketEvent event = WebSocketEvent.builder()
                .type("NEW_ORDER")
                .businessId(businessId)
                .payload(Map.of(
                        "orderId", order.getId().toString(),
                        "orderNumber", order.getOrderNumber(),
                        "status", order.getOrderStatus().name()
                ))
                .build();
        messagingTemplate.convertAndSend("/topic/" + businessId + "/orders", event);
        log.info("[WS] NEW_ORDER sent for business {}", businessId);
    }

    @Override
    @Async("taskExecutor")
    public void notifyOrderStatusChanged(Order order) {
        if (order.getBusinessId() == null) return;
        String businessId = order.getBusinessId().toString();
        WebSocketEvent event = WebSocketEvent.builder()
                .type("ORDER_STATUS_CHANGED")
                .businessId(businessId)
                .payload(Map.of(
                        "orderId", order.getId().toString(),
                        "orderNumber", order.getOrderNumber(),
                        "status", order.getOrderStatus().name()
                ))
                .build();
        messagingTemplate.convertAndSend("/topic/" + businessId + "/orders", event);
        log.info("[WS] ORDER_STATUS_CHANGED sent for business {}", businessId);
    }

    @Override
    @Async("taskExecutor")
    public void notifyStockUpdated(UUID businessId, UUID productId) {
        if (businessId == null) return;
        String bid = businessId.toString();
        WebSocketEvent event = WebSocketEvent.builder()
                .type("STOCK_UPDATED")
                .businessId(bid)
                .payload(Map.of("productId", productId.toString()))
                .build();
        messagingTemplate.convertAndSend("/topic/" + bid + "/stock", event);
        log.info("[WS] STOCK_UPDATED sent for business {}", bid);
    }

    @Override
    @Async("taskExecutor")
    public void notifyPlatformEvent(String type, Map<String, Object> payload) {
        WebSocketEvent event = WebSocketEvent.builder()
                .type(type)
                .payload(payload)
                .build();
        messagingTemplate.convertAndSend("/topic/platform", event);
        log.info("[WS] Platform event {} sent", type);
    }
}
