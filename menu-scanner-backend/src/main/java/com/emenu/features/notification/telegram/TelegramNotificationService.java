package com.emenu.features.notification.telegram;

import com.emenu.features.order.models.Order;

import java.util.List;
import java.util.UUID;

public interface TelegramNotificationService {

    // ── Low-level send ────────────────────────────────────────────────────────

    void sendToGroup(UUID businessId, String message);

    void sendHtmlToGroup(UUID businessId, String htmlMessage);

    // ── Business / bot management ─────────────────────────────────────────────

    /**
     * Persists the Telegram group chat ID to business settings and returns the business name,
     * or null if the business was not found.
     */
    String linkGroupToBusinessId(UUID businessId, long chatId);

    // ── Order notifications (async) ───────────────────────────────────────────

    void notifyNewCustomerOrder(Order order);

    void notifyNewPOSOrder(Order order);

    void notifyOrderStatusChanged(Order order);

    // ── Staff notifications (async) ───────────────────────────────────────────

    void notifyNewStaff(UUID businessId, String name, String position,
                        String phone, String email, List<String> roles);

    // ── Bot events ────────────────────────────────────────────────────────────

    void notifyGroupLinked(long chatId, String businessName);
}
