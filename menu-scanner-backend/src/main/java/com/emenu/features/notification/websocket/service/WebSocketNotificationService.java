package com.emenu.features.notification.websocket.service;

import com.emenu.features.order.models.Order;

import java.util.Map;
import java.util.UUID;

public interface WebSocketNotificationService {
    void notifyNewOrder(Order order);
    void notifyOrderStatusChanged(Order order);
    void notifyStockUpdated(UUID businessId, UUID productId);
    void notifyPlatformEvent(String type, Map<String, Object> payload);
    void notifyImportProgress(String importId, int progress, int processed, int total, int successCount, int errorCount, boolean done, Map<String, Object> lastResult);
}
