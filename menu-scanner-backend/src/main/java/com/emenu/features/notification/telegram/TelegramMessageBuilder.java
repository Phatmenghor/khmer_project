package com.emenu.features.notification.telegram;

import com.emenu.enums.order.OrderStatus;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderItem;
import com.emenu.features.order.models.OrderItemCustomization;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

public final class TelegramMessageBuilder {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a");

    private TelegramMessageBuilder() {}

    // ── New customer order (checkout) ────────────────────────────────────────

    public static String newCustomerOrder(Order order) {
        return buildReceipt("🛒 NEW ORDER", order);
    }

    // ── POS sale ─────────────────────────────────────────────────────────────

    public static String newPOSOrder(Order order) {
        return buildReceipt("🏪 POS SALE", order);
    }

    // ── Order status update ───────────────────────────────────────────────────

    public static String orderStatusChanged(Order order) {
        String header = switch (order.getOrderStatus()) {
            case CONFIRMED -> "✅ ORDER CONFIRMED";
            case COMPLETED -> "✅ ORDER COMPLETED";
            case CANCELLED -> "❌ ORDER CANCELLED";
            default        -> "📋 ORDER UPDATED";
        };

        StringBuilder sb = new StringBuilder();
        sb.append("<b>").append(header).append("</b>\n");
        line(sb);
        sb.append("Order:   <b>").append(order.getOrderNumber()).append("</b>\n");
        sb.append("Status:  ").append(statusLabel(order.getOrderStatus())).append("\n");
        if (hasText(order.getCustomerName())) {
            sb.append("Customer: ").append(order.getCustomerName()).append("\n");
        }
        if (order.getTotalAmount() != null) {
            line(sb);
            sb.append("Total:   <b>$").append(fmt(order.getTotalAmount())).append("</b>\n");
        }
        return sb.toString().trim();
    }

    // ── New staff added ───────────────────────────────────────────────────────

    public static String newStaff(String name, String position, String phone,
                                   String email, List<String> roles) {
        StringBuilder sb = new StringBuilder();
        sb.append("<b>👤 NEW STAFF ADDED</b>\n");
        line(sb);
        if (hasText(name))     sb.append("Name:     ").append(name).append("\n");
        if (hasText(position)) sb.append("Position: ").append(position).append("\n");
        if (hasText(phone))    sb.append("Phone:    ").append(phone).append("\n");
        if (hasText(email))    sb.append("Email:    ").append(email).append("\n");
        if (roles != null && !roles.isEmpty()) {
            sb.append("Role:     ").append(String.join(", ", roles)).append("\n");
        }
        return sb.toString().trim();
    }

    // ── Subscription alerts (admin group) ────────────────────────────────────

    public static String businessOwnerRegistered(String ownerName, String businessName,
                                                  String planName, String expiryDate) {
        return "<b>🎉 NEW BUSINESS OWNER REGISTERED</b>\n" +
            "Owner: " + ownerName + "\n" +
            "Business: " + businessName + "\n" +
            "Plan: " + planName + "\n" +
            "Expiry: " + expiryDate;
    }

    public static String subscriptionExpiringSoon(String businessName, long daysRemaining, String expiryDate) {
        return "<b>⚠️ SUBSCRIPTION EXPIRING SOON</b>\n" +
            "Business: " + businessName + "\n" +
            "Days Remaining: " + daysRemaining + "\n" +
            "Expiry: " + expiryDate;
    }

    public static String subscriptionRenewed(String businessName, String planName, String newExpiryDate) {
        return "<b>✅ SUBSCRIPTION RENEWED</b>\n" +
            "Business: " + businessName + "\n" +
            "Plan: " + planName + "\n" +
            "New Expiry: " + newExpiryDate;
    }

    public static String subscriptionCancelled(String businessName) {
        return "<b>❌ SUBSCRIPTION CANCELLED</b>\n" +
            "Business: " + businessName;
    }

    public static String subscriptionPlanChanged(String businessName, String oldPlanName,
                                                  String newPlanName, String newExpiryDate) {
        return "<b>🔄 SUBSCRIPTION PLAN CHANGED</b>\n" +
            "Business: " + businessName + "\n" +
            "Old Plan: " + oldPlanName + "\n" +
            "New Plan: " + newPlanName + "\n" +
            "New Expiry: " + newExpiryDate;
    }

    // ── Test message ─────────────────────────────────────────────────────────

    public static String testMessage() {
        return "<b>✅ TEST MESSAGE</b>\n\n" +
            "Your Telegram monitoring is working correctly.\n" +
            "You will receive order and staff alerts in this group.";
    }

    // ── Group linked welcome ──────────────────────────────────────────────────

    public static String groupLinked(String businessName) {
        return "<b>🔗 GROUP LINKED</b>\n\n" +
            "This group is now the monitoring channel for <b>" + businessName + "</b>.\n\n" +
            "You will receive alerts for:\n" +
            "  • New customer orders\n" +
            "  • POS sales\n" +
            "  • Order status updates\n" +
            "  • New staff added";
    }

    // ── Full receipt builder ──────────────────────────────────────────────────

    private static String buildReceipt(String title, Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("<b>").append(title).append("</b>\n");
        line(sb);

        // Header info
        sb.append("🧾 <b>").append(order.getOrderNumber()).append("</b>\n");
        if (order.getCreatedAt() != null) {
            sb.append("📅 ").append(order.getCreatedAt().format(DATE_FMT)).append("\n");
        }
        if (hasText(order.getBusinessName())) {
            sb.append("🏪 ").append(order.getBusinessName()).append("\n");
        }
        if (hasText(order.getCustomerName())) {
            sb.append("👤 ").append(order.getCustomerName()).append("\n");
        }
        if (hasText(order.getCustomerPhone())) {
            sb.append("📞 ").append(order.getCustomerPhone()).append("\n");
        }

        // Items
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            line(sb);
            sb.append("<b>Items</b>\n");
            for (OrderItem item : order.getItems()) {
                String name = item.getProductName() != null ? item.getProductName() : "Product";
                if (hasText(item.getSizeName()) && !"Standard".equalsIgnoreCase(item.getSizeName())) {
                    name += " (" + item.getSizeName() + ")";
                }
                sb.append("• <b>").append(name).append("</b>");
                sb.append("  x").append(item.getQuantity());
                if (item.getFinalPrice() != null) {
                    sb.append("  $").append(fmt(item.getFinalPrice()));
                }
                // Promotion
                if (Boolean.TRUE.equals(item.getHasPromotion()) && item.getPromotionType() != null) {
                    if ("PERCENTAGE".equals(item.getPromotionType())) {
                        sb.append(" <i>(-").append(fmt(item.getPromotionValue())).append("%)</i>");
                    } else {
                        sb.append(" <i>(-$").append(fmt(item.getPromotionValue())).append(")</i>");
                    }
                }
                sb.append("\n");
                // Customizations
                Set<OrderItemCustomization> customs = item.getItemCustomizations();
                if (customs != null && !customs.isEmpty()) {
                    for (OrderItemCustomization c : customs) {
                        sb.append("    ➕ ").append(c.getName());
                        if (c.getPriceAdjustment() != null && c.getPriceAdjustment().compareTo(BigDecimal.ZERO) > 0) {
                            sb.append("  +$").append(fmt(c.getPriceAdjustment()));
                        }
                        sb.append("\n");
                    }
                }
            }
        }

        // Pricing summary
        line(sb);
        if (order.getSubtotal() != null) {
            sb.append("Subtotal:       $").append(fmt(order.getSubtotal())).append("\n");
        }
        if (order.getCustomizationTotal() != null && order.getCustomizationTotal().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Add-ons:        $").append(fmt(order.getCustomizationTotal())).append("\n");
        }
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Discount:      -$").append(fmt(order.getDiscountAmount())).append("\n");
        }
        if (order.getDeliveryFee() != null && order.getDeliveryFee().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Delivery:       $").append(fmt(order.getDeliveryFee())).append("\n");
        }
        if (order.getTaxAmount() != null && order.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Tax:            $").append(fmt(order.getTaxAmount())).append("\n");
        }
        if (order.getPaymentMethod() != null) {
            sb.append("Payment:        ").append(order.getPaymentMethod().name()).append("\n");
        }
        line(sb);
        if (order.getTotalAmount() != null) {
            sb.append("💰 <b>TOTAL: $").append(fmt(order.getTotalAmount())).append("</b>\n");
        }

        return sb.toString().trim();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static void line(StringBuilder sb) {
        sb.append("─────────────────────\n");
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
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
