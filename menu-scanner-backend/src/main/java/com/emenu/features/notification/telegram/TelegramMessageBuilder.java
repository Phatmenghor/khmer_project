package com.emenu.features.notification.telegram;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderItem;

import java.math.BigDecimal;
import java.util.List;

public final class TelegramMessageBuilder {

    private TelegramMessageBuilder() {}

    // ── New customer order (checkout) ────────────────────────────────────────

    public static String newCustomerOrder(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<b>NEW ORDER</b>\n\n");
        sb.append("Order:    <b>").append(esc(order.getOrderNumber())).append("</b>\n");
        sb.append("Status:   ").append(statusLabel(order.getOrderStatus())).append("\n");

        if (hasText(order.getCustomerName())) {
            sb.append("Customer: ").append(esc(order.getCustomerName())).append("\n");
        }
        if (hasText(order.getCustomerPhone())) {
            sb.append("Phone:    ").append(esc(order.getCustomerPhone())).append("\n");
        }

        appendItems(sb, order.getItems());
        appendTotal(sb, order.getTotalAmount());

        return sb.toString().trim();
    }

    // ── POS sale ─────────────────────────────────────────────────────────────

    public static String newPOSOrder(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<b>POS SALE</b>\n\n");
        sb.append("Order:    <b>").append(esc(order.getOrderNumber())).append("</b>\n");
        sb.append("Status:   ").append(statusLabel(order.getOrderStatus())).append("\n");

        if (hasText(order.getCustomerName())) {
            sb.append("Customer: ").append(esc(order.getCustomerName())).append("\n");
        }
        if (hasText(order.getCustomerPhone())) {
            sb.append("Phone:    ").append(esc(order.getCustomerPhone())).append("\n");
        }

        appendItems(sb, order.getItems());
        appendTotal(sb, order.getTotalAmount());

        return sb.toString().trim();
    }

    // ── Order status update ───────────────────────────────────────────────────

    public static String orderStatusChanged(Order order) {
        String header = switch (order.getOrderStatus()) {
            case CONFIRMED -> "ORDER CONFIRMED";
            case COMPLETED -> "ORDER COMPLETED";
            case CANCELLED -> "ORDER CANCELLED";
            default        -> "ORDER UPDATED";
        };

        StringBuilder sb = new StringBuilder();
        sb.append("<b>").append(header).append("</b>\n\n");
        sb.append("Order:    <b>").append(esc(order.getOrderNumber())).append("</b>\n");

        if (hasText(order.getCustomerName())) {
            sb.append("Customer: ").append(esc(order.getCustomerName())).append("\n");
        }
        appendTotal(sb, order.getTotalAmount());

        if (order.getOrderStatus() == OrderStatus.CONFIRMED) {
            sb.append("\nItems are being prepared.");
        }

        return sb.toString().trim();
    }

    // ── New staff added ───────────────────────────────────────────────────────

    public static String newStaff(String name, String position, String phone,
                                   String email, List<String> roles) {
        StringBuilder sb = new StringBuilder();
        sb.append("<b>NEW STAFF ADDED</b>\n\n");

        if (hasText(name)) {
            sb.append("Name:     ").append(esc(name)).append("\n");
        }
        if (hasText(position)) {
            sb.append("Position: ").append(esc(position)).append("\n");
        }
        if (hasText(phone)) {
            sb.append("Phone:    ").append(esc(phone)).append("\n");
        }
        if (hasText(email)) {
            sb.append("Email:    ").append(esc(email)).append("\n");
        }
        if (roles != null && !roles.isEmpty()) {
            sb.append("Role:     ").append(esc(String.join(", ", roles))).append("\n");
        }

        return sb.toString().trim();
    }

    // ── Subscription alerts (admin group) ────────────────────────────────────

    public static String businessOwnerRegistered(String ownerName, String businessName,
                                                  String planName, String expiryDate) {
        return "*NEW BUSINESS OWNER REGISTERED*\n\n" +
            "Owner: " + esc(ownerName) + "\n" +
            "Business: " + esc(businessName) + "\n" +
            "Plan: " + esc(planName) + "\n" +
            "Expiry Date: " + esc(expiryDate);
    }

    public static String subscriptionExpiringSoon(String businessName, long daysRemaining, String expiryDate) {
        return "*ALERT: SUBSCRIPTION EXPIRING SOON*\n\n" +
            "Business: " + esc(businessName) + "\n" +
            "Days Remaining: " + daysRemaining + "\n" +
            "Expiry Date: " + esc(expiryDate);
    }

    public static String subscriptionRenewed(String businessName, String planName, String newExpiryDate) {
        return "*SUBSCRIPTION RENEWED*\n\n" +
            "Business: " + esc(businessName) + "\n" +
            "Plan: " + esc(planName) + "\n" +
            "New Expiry Date: " + esc(newExpiryDate);
    }

    public static String subscriptionCancelled(String businessName) {
        return "*SUBSCRIPTION CANCELLED*\n\n" +
            "Business: " + esc(businessName);
    }

    public static String subscriptionPlanChanged(String businessName, String oldPlanName,
                                                  String newPlanName, String newExpiryDate) {
        return "*SUBSCRIPTION PLAN CHANGED*\n\n" +
            "Business: " + esc(businessName) + "\n" +
            "Old Plan: " + esc(oldPlanName) + "\n" +
            "New Plan: " + esc(newPlanName) + "\n" +
            "New Expiry Date: " + esc(newExpiryDate);
    }

    // ── Test message ─────────────────────────────────────────────────────────

    public static String testMessage() {
        return "<b>TEST MESSAGE</b>\n\n" +
            "Your Telegram monitoring is working correctly.\n" +
            "You will receive order and staff alerts in this group.";
    }

    // ── Group linked welcome ──────────────────────────────────────────────────

    public static String groupLinked(String businessName) {
        return "<b>GROUP LINKED</b>\n\n" +
            "This group is now the monitoring channel for <b>" + esc(businessName) + "</b>.\n\n" +
            "You will receive alerts for:\n" +
            "  - New customer orders\n" +
            "  - POS sales\n" +
            "  - Order status updates (confirmed, completed, cancelled)\n" +
            "  - New staff added";
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    private static void appendItems(StringBuilder sb, List<OrderItem> items) {
        if (items == null || items.isEmpty()) return;

        sb.append("\n<b>Items</b>\n");
        for (OrderItem item : items) {
            sb.append("  ").append(esc(item.getProductName()));
            if (hasText(item.getSizeName()) && !"Standard".equalsIgnoreCase(item.getSizeName())) {
                sb.append(" (").append(esc(item.getSizeName())).append(")");
            }
            sb.append("  x").append(item.getQuantity());
            if (item.getTotalPrice() != null) {
                sb.append("  <code>$").append(fmt(item.getTotalPrice())).append("</code>");
            }
            sb.append("\n");
        }
    }

    private static void appendTotal(StringBuilder sb, BigDecimal total) {
        sb.append("\n");
        if (total != null) {
            sb.append("Total:    <b>$").append(fmt(total)).append("</b>\n");
        }
    }

    private static String statusLabel(OrderStatus status) {
        if (status == null) return "-";
        return switch (status) {
            case PENDING   -> "Pending";
            case CONFIRMED -> "Confirmed";
            case COMPLETED -> "Completed";
            case CANCELLED -> "Cancelled";
        };
    }

    private static String fmt(BigDecimal amount) {
        return String.format("%.2f", amount);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static String esc(String s) {
        if (s == null) return "";
        // Escape MarkdownV2 special characters
        return s.replace("\\", "\\\\")
                .replace("_", "\\_")
                .replace("*", "\\*")
                .replace("[", "\\[")
                .replace("]", "\\]")
                .replace("(", "\\(")
                .replace(")", "\\)")
                .replace("~", "\\~")
                .replace("`", "\\`")
                .replace(">", "\\>")
                .replace("#", "\\#")
                .replace("+", "\\+")
                .replace("-", "\\-")
                .replace(".", "\\.")
                .replace("!", "\\!");
    }
}
