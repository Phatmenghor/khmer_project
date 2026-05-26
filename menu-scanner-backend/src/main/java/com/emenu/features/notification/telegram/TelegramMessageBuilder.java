package com.emenu.features.notification.telegram;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
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

        if (hasText(order.getCustomerName())) {
            sb.append("Customer: ").append(esc(order.getCustomerName())).append("\n");
        }
        if (hasText(order.getCustomerPhone())) {
            sb.append("Phone:    ").append(esc(order.getCustomerPhone())).append("\n");
        }

        List<OrderItem> items = order.getItems();
        if (items != null && !items.isEmpty()) {
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

        sb.append("\n");
        appendPricingLines(sb, order);

        sb.append("Payment:  ").append(paymentMethodLabel(order.getPaymentMethod()))
          .append("  ").append(paymentStatusLabel(order.getPaymentStatus())).append("\n");

        if (hasText(order.getCustomerNote())) {
            sb.append("\nNote: <i>").append(esc(order.getCustomerNote())).append("</i>");
        }

        return sb.toString().trim();
    }

    // ── POS sale ─────────────────────────────────────────────────────────────

    public static String newPOSOrder(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<b>POS SALE</b>\n\n");
        sb.append("Order:    <b>").append(esc(order.getOrderNumber())).append("</b>\n");

        if (hasText(order.getCustomerName())) {
            sb.append("Customer: ").append(esc(order.getCustomerName())).append("\n");
        }
        if (hasText(order.getCustomerPhone())) {
            sb.append("Phone:    ").append(esc(order.getCustomerPhone())).append("\n");
        }

        int itemCount = order.getItems() != null ? order.getItems().size() : 0;
        sb.append("Items:    ").append(itemCount).append("\n");

        if (order.getTotalAmount() != null) {
            sb.append("Total:    <b>$").append(fmt(order.getTotalAmount())).append("</b>\n");
        }
        sb.append("Payment:  Cash  Paid");
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
        if (order.getTotalAmount() != null) {
            sb.append("Total:    <b>$").append(fmt(order.getTotalAmount())).append("</b>")
              .append("  ").append(paymentMethodLabel(order.getPaymentMethod())).append("\n");
        }

        if (order.getOrderStatus() == OrderStatus.CONFIRMED) {
            sb.append("\nItems are being prepared.");
        }

        return sb.toString().trim();
    }

    // ── Payment received ─────────────────────────────────────────────────────

    public static String paymentReceived(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<b>PAYMENT RECEIVED</b>\n\n");
        sb.append("Order:    <b>").append(esc(order.getOrderNumber())).append("</b>\n");

        if (hasText(order.getCustomerName())) {
            sb.append("Customer: ").append(esc(order.getCustomerName())).append("\n");
        }
        if (order.getTotalAmount() != null) {
            sb.append("Amount:   <b>$").append(fmt(order.getTotalAmount())).append("</b>\n");
        }
        sb.append("Method:   ").append(paymentMethodLabel(order.getPaymentMethod()));
        return sb.toString().trim();
    }

    // ── Group linked welcome ──────────────────────────────────────────────────

    public static String groupLinked(String businessName) {
        return "<b>GROUP LINKED</b>\n\n" +
            "This group is now the monitoring channel for <b>" + esc(businessName) + "</b>.\n\n" +
            "You will receive alerts for:\n" +
            "  - New customer orders\n" +
            "  - POS sales\n" +
            "  - Order status updates (confirmed, completed, cancelled)\n" +
            "  - Payment confirmations";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static void appendPricingLines(StringBuilder sb, Order order) {
        if (order.getSubtotal() != null && order.getSubtotal().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Subtotal: <code>$").append(fmt(order.getSubtotal())).append("</code>\n");
        }
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Discount: <code>-$").append(fmt(order.getDiscountAmount())).append("</code>\n");
        }
        if (order.getDeliveryFee() != null && order.getDeliveryFee().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Delivery: <code>$").append(fmt(order.getDeliveryFee())).append("</code>\n");
        }
        if (order.getTaxAmount() != null && order.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Tax:      <code>$").append(fmt(order.getTaxAmount())).append("</code>\n");
        }
        if (order.getTotalAmount() != null) {
            sb.append("Total:    <b>$").append(fmt(order.getTotalAmount())).append("</b>\n");
        }
    }

    private static String fmt(BigDecimal amount) {
        return String.format("%.2f", amount);
    }

    private static String paymentMethodLabel(PaymentMethod method) {
        if (method == null) return "-";
        return switch (method) {
            case CASH -> "Cash";
            case BANK -> "Bank Transfer";
        };
    }

    private static String paymentStatusLabel(PaymentStatus status) {
        if (status == null) return "-";
        return switch (status) {
            case PAID, COMPLETED -> "Paid";
            case UNPAID          -> "Unpaid";
            case PENDING         -> "Pending";
            case FAILED          -> "Failed";
            case REFUNDED        -> "Refunded";
            case CANCELLED       -> "Cancelled";
        };
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
