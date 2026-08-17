package com.emenu.features.notification.telegram.service;

import com.emenu.features.notification.telegram.dto.response.TelegramStatusResponse;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.TableSession;
import com.emenu.features.order.models.TableSessionItem;

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

    String linkGroupToBusinessId(UUID businessId, long chatId);

    // ── Order notifications (async) ───────────────────────────────────────────

    void notifyNewCustomerOrder(Order order);

    void notifyNewPOSOrder(Order order);

    void notifyOrderStatusChanged(Order order);

    // ── Table Session notifications (text-only async) ─────────────────────────

    void notifyTableSessionItemAdded(TableSession session, TableSessionItem newItem);

    void notifyTableSessionRoundAdded(TableSession session, int orderRound, List<TableSessionItem> addedItems);

    void notifyTableSessionSettled(TableSession session, Order order);

    void notifyTableReset(UUID businessId, String tableNumber);

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
