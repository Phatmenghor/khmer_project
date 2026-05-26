package com.emenu.features.notification.telegram;

import com.emenu.features.order.models.Order;

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

    // ── Order notifications ───────────────────────────────────────────────────

    /** New order placed by a customer via the public checkout flow. */
    void notifyNewCustomerOrder(Order order);

    /** POS sale completed by a business operator. */
    void notifyNewPOSOrder(Order order);

    /** Order status changed (CONFIRMED / COMPLETED / CANCELLED). */
    void notifyOrderStatusChanged(Order order);

    /** Payment status changed to PAID for an order. */
    void notifyPaymentReceived(Order order);

    // ── Bot events ────────────────────────────────────────────────────────────

    /** Sends the welcome/confirmation message directly to the newly linked chat. */
    void notifyGroupLinked(long chatId, String businessName);
}
