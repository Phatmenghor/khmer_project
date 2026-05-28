package com.emenu.features.notification.telegram.service;

import com.emenu.features.notification.telegram.dto.response.TelegramStatusResponse;
import com.emenu.features.order.models.Order;

import java.util.List;
import java.util.UUID;

public interface TelegramNotificationService {

    // ── Status & management ───────────────────────────────────────────────────

    TelegramStatusResponse getStatus(UUID businessId);

    void sendTestMessage(UUID businessId);

    // ── Low-level send ────────────────────────────────────────────────────────

    void sendToGroup(UUID businessId, String message);

    void sendHtmlToGroup(UUID businessId, String htmlMessage);

    void sendAdminAlert(String message);

    // ── Bot management ────────────────────────────────────────────────────────

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

    // ── Subscription notifications (async) ─────────────────────────────────────

    void notifyBusinessOwnerRegistered(UUID businessId, String ownerName, String businessName,
                                       String planName, String expiryDate);

    void notifySubscriptionExpiringSoon(UUID businessId, String businessName,
                                        long daysRemaining, String expiryDate);

    void notifySubscriptionRenewed(UUID businessId, String businessName,
                                   String planName, String newExpiryDate);

    void notifySubscriptionCancelled(UUID businessId, String businessName);

    void notifySubscriptionPlanChanged(UUID businessId, String businessName,
                                       String oldPlanName, String newPlanName, String newExpiryDate);

    // ── Bot events ────────────────────────────────────────────────────────────

    void notifyGroupLinked(long chatId, String businessName);
}
