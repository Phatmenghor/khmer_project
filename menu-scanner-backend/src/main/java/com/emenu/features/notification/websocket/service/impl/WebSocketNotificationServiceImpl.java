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
        try {
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
        } catch (Exception e) {
            log.error("[WS] Failed to send NEW_ORDER notification for business {}: {}", businessId, e.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyOrderStatusChanged(Order order) {
        if (order.getBusinessId() == null) return;
        String businessId = order.getBusinessId().toString();
        try {
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
        } catch (Exception e) {
            log.error("[WS] Failed to send ORDER_STATUS_CHANGED notification for business {}: {}", businessId, e.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyStockUpdated(UUID businessId, UUID productId) {
        if (businessId == null) return;
        String bid = businessId.toString();
        try {
            WebSocketEvent event = WebSocketEvent.builder()
                    .type("STOCK_UPDATED")
                    .businessId(bid)
                    .payload(Map.of("productId", productId.toString()))
                    .build();
            messagingTemplate.convertAndSend("/topic/" + bid + "/stock", event);
            log.info("[WS] STOCK_UPDATED sent for business {}", bid);
        } catch (Exception e) {
            log.error("[WS] Failed to send STOCK_UPDATED notification for business {}: {}", bid, e.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyPlatformEvent(String type, Map<String, Object> payload) {
        // Platform events disabled
    }

    @Override
    @Async("taskExecutor")
    public void notifyTableEvent(UUID businessId, String eventType, Map<String, Object> payload) {
        if (businessId == null) return;
        String bid = businessId.toString();
        try {
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("type", eventType != null ? eventType : "TABLE_STATUS_UPDATED");
            if (payload != null) {
                data.putAll(payload);
            }
            messagingTemplate.convertAndSend("/topic/" + bid + "/tables", data);
            log.info("[WS] Table event {} sent for business {}", eventType, bid);
        } catch (Exception e) {
            log.error("[WS] Failed to send table event for business {}: {}", bid, e.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyImportProgress(String importId, int progress, int processed, int total, int successCount, int errorCount, boolean done, Map<String, Object> lastResult) {
        if (importId == null) return;
        try {
            WebSocketEvent event = WebSocketEvent.builder()
                    .type("IMPORT_PROGRESS")
                    .payload(Map.of(
                            "importId", importId,
                            "progress", progress,
                            "processed", processed,
                            "total", total,
                            "successCount", successCount,
                            "errorCount", errorCount,
                            "done", done,
                            "lastResult", lastResult != null ? lastResult : Map.of()
                    ))
                    .build();
            messagingTemplate.convertAndSend("/topic/import-progress/" + importId, event);
            log.info("[WS] IMPORT_PROGRESS sent for importId {}: progress={}%", importId, progress);
        } catch (Exception e) {
            log.error("[WS] Failed to send IMPORT_PROGRESS notification for importId {}: {}", importId, e.getMessage());
        }
    }
}
