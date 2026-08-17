package com.emenu.features.notification.telegram;

import com.emenu.enums.order.OrderStatus;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderDeliveryAddress;
import com.emenu.features.order.models.OrderItem;
import com.emenu.features.order.models.OrderItemCustomization;
import com.emenu.features.order.models.TableSession;
import com.emenu.features.order.models.TableSessionItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class TelegramMessageBuilder {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");

    private TelegramMessageBuilder() {}

    public static String newCustomerOrder(Order order) {
        return buildCleanReceiptMessage(order, "🛍️ <b>NEW CUSTOMER ORDER RECEIVED</b>");
    }

    public static String newPOSOrder(Order order) {
        return buildCleanReceiptMessage(order, "⚡ <b>NEW POS ORDER CREATED</b>");
    }

    public static String orderStatusChanged(Order order) {
        String statusLabel = order.getOrderStatus() != null ? order.getOrderStatus().name() : "UPDATED";
        String statusEmoji = getStatusEmoji(order.getOrderStatus());
        return buildCleanReceiptMessage(order, statusEmoji + " <b>ORDER STATUS UPDATED: " + statusLabel + "</b>");
    }

    public static String newTableSessionItem(TableSession session, TableSessionItem newItem) {
        return newTableSessionRound(session, newItem.getOrderRound() != null ? newItem.getOrderRound() : 1, List.of(newItem));
    }

    public static String newTableSessionRound(TableSession session, int orderRound, List<TableSessionItem> addedItems) {
        StringBuilder sb = new StringBuilder();

        // 1. Header
        sb.append("🍽️ <b>NEW TABLE ITEM ADDED</b>\n\n");

        // 2. Session Info
        String tableStr = session.getTableNumber() != null
                ? (session.getTableNumber().startsWith("Table ") ? session.getTableNumber() : "Table " + session.getTableNumber())
                : "Table";
        String cleanSessionNum = session.getSessionNumber() != null
                ? session.getSessionNumber().replaceAll("(?i)^(SESS-?|Session\\s*)", "")
                : "";

        sb.append("• <b>Table:</b> ").append(escapeHtml(tableStr)).append("\n");
        sb.append("• <b>Session Code:</b> <code>#").append(escapeHtml(cleanSessionNum)).append("</code>\n");
        sb.append("• <b>Round:</b> Round ").append(orderRound).append("\n");
        LocalDateTime itemTime = (addedItems != null && !addedItems.isEmpty() && addedItems.get(0).getCreatedAt() != null)
                ? addedItems.get(0).getCreatedAt()
                : LocalDateTime.now();
        sb.append("• <b>Date/Time:</b> ").append(itemTime.format(DATE_FMT)).append("\n\n");

        // 3. Added Items List
        int addedCount = addedItems != null ? addedItems.stream().mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 1).sum() : 0;
        sb.append("🛒 <b>Added Items</b> (").append(addedCount).append(" ").append(addedCount == 1 ? "item" : "items").append("):\n");
        if (addedItems != null && !addedItems.isEmpty()) {
            int idx = 1;
            for (TableSessionItem newItem : addedItems) {
                String name = newItem.getProductName() != null ? newItem.getProductName() : "Product Item";
                BigDecimal lineTotal = newItem.getTotalPrice() != null ? newItem.getTotalPrice() :
                        (newItem.getUnitPrice() != null ? newItem.getUnitPrice().multiply(new BigDecimal(newItem.getQuantity() != null ? newItem.getQuantity() : 1)) : BigDecimal.ZERO);

                sb.append(idx++).append(". <b>").append(escapeHtml(name)).append("</b> × ").append(newItem.getQuantity() != null ? newItem.getQuantity() : 1)
                  .append(" — <b>$").append(fmt(lineTotal)).append("</b>\n");

                if (hasText(newItem.getSizeName()) && !"Standard".equalsIgnoreCase(newItem.getSizeName()) && !"null".equalsIgnoreCase(newItem.getSizeName())) {
                    sb.append("   <i>Size: ").append(escapeHtml(newItem.getSizeName())).append("</i>\n");
                }
                if (newItem.getCustomizationTotal() != null && newItem.getCustomizationTotal().compareTo(BigDecimal.ZERO) > 0) {
                    sb.append("   <i>Add-ons: +$").append(fmt(newItem.getCustomizationTotal())).append("</i>\n");
                }
                if (hasText(newItem.getCustomerNote())) {
                    sb.append("   <i>Note: \"").append(escapeHtml(newItem.getCustomerNote())).append("\"</i>\n");
                }
            }
        }

        // 4. Summary (Round Total & Overall Table Total)
        sb.append("\n------------------------------------------\n");
        BigDecimal roundTotal = addedItems != null
                ? addedItems.stream()
                        .map(i -> i.getTotalPrice() != null ? i.getTotalPrice() : (i.getUnitPrice() != null ? i.getUnitPrice().multiply(new BigDecimal(i.getQuantity() != null ? i.getQuantity() : 1)) : BigDecimal.ZERO))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                : BigDecimal.ZERO;
        int roundAddedItemsCount = addedItems != null ? addedItems.stream().mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 1).sum() : 0;
        int totalItemsCount = session.getTotalItems() != null ? session.getTotalItems() : roundAddedItemsCount;
        BigDecimal tableTotal = session.getTotalAmount() != null ? session.getTotalAmount() : roundTotal;

        sb.append("💰 <b>ROUND TOTAL:</b> <b>$").append(fmt(roundTotal)).append("</b> (").append(roundAddedItemsCount).append(" ").append(roundAddedItemsCount == 1 ? "item" : "items").append(")\n");
        sb.append("💰 <b>OVERALL TABLE TOTAL:</b> <b>$").append(fmt(tableTotal)).append("</b> (").append(totalItemsCount).append(" ").append(totalItemsCount == 1 ? "item" : "items").append(")\n");

        return sb.toString();
    }

    public static String tableSessionSettled(TableSession session, Order order) {
        StringBuilder sb = new StringBuilder();

        // 1. Header
        sb.append("✅ <b>TABLE SESSION SETTLED & PAID</b>\n\n");

        // 2. Session Info
        String tableStr = session.getTableNumber() != null
                ? (session.getTableNumber().startsWith("Table ") ? session.getTableNumber() : "Table " + session.getTableNumber())
                : "Table";
        String cleanSessionNum = session.getSessionNumber() != null
                ? session.getSessionNumber().replaceAll("(?i)^(SESS-?|Session\\s*)", "")
                : "";

        sb.append("• <b>Table:</b> ").append(escapeHtml(tableStr)).append("\n");
        sb.append("• <b>Session Code:</b> <code>#").append(escapeHtml(cleanSessionNum)).append("</code>\n");
        LocalDateTime settledTime = session.getClosedAt() != null ? session.getClosedAt() : LocalDateTime.now();
        sb.append("• <b>Date/Time:</b> ").append(settledTime.format(DATE_FMT)).append("\n");
        if (order != null && hasText(order.getOrderNumber())) {
            sb.append("• <b>Order Number:</b> <code>#").append(escapeHtml(order.getOrderNumber())).append("</code>\n");
        }
        if (order != null && order.getPaymentMethod() != null) {
            sb.append("• <b>Payment Method:</b> ").append(escapeHtml(order.getPaymentMethod().name())).append("\n");
        }

        // 3. Items List (if order present)
        if (order != null && order.getItems() != null && !order.getItems().isEmpty()) {
            sb.append("\n🛒 <b>Consolidated Items</b> (").append(order.getItems().size()).append(" item").append(order.getItems().size() > 1 ? "s" : "").append("):\n");
            int idx = 1;
            for (OrderItem item : order.getItems()) {
                String name = item.getProductName() != null ? item.getProductName() : "Product";
                BigDecimal lineTotal = item.getTotalPrice() != null ? item.getTotalPrice() :
                        (item.getFinalPrice() != null ? item.getFinalPrice().multiply(new BigDecimal(item.getQuantity())) : BigDecimal.ZERO);

                sb.append(idx++).append(". <b>").append(escapeHtml(name)).append("</b> × ").append(item.getQuantity())
                  .append(" — <b>$").append(fmt(lineTotal)).append("</b>\n");

                if (hasText(item.getSizeName()) && !"Standard".equalsIgnoreCase(item.getSizeName()) && !"null".equalsIgnoreCase(item.getSizeName())) {
                    sb.append("   <i>Size: ").append(escapeHtml(item.getSizeName())).append("</i>\n");
                }
                Set<OrderItemCustomization> customs = item.getItemCustomizations();
                if (customs != null && !customs.isEmpty()) {
                    for (OrderItemCustomization c : customs) {
                        BigDecimal adj = c.getPriceAdjustment() != null ? c.getPriceAdjustment() : BigDecimal.ZERO;
                        sb.append("   <i>+ ").append(escapeHtml(c.getName()));
                        if (adj.compareTo(BigDecimal.ZERO) > 0) {
                            sb.append(" (+$").append(fmt(adj)).append(")");
                        }
                        sb.append("</i>\n");
                    }
                }
            }
        }

        // 4. Final Total
        sb.append("\n------------------------------------------\n");
        BigDecimal finalTotal = order != null && order.getTotalAmount() != null ? order.getTotalAmount() : session.getTotalAmount();
        sb.append("💰 <b>FINAL SETTLED TOTAL:</b> <b>$").append(fmt(finalTotal)).append("</b>\n");

        return sb.toString();
    }

    public static String newStaff(String name, String position, String phone,
                                   String email, List<String> roles) {
        StringBuilder sb = new StringBuilder();
        sb.append("👤 <b>NEW STAFF ADDED</b>\n\n");
        if (hasText(name))     sb.append("• <b>Name:</b> ").append(escapeHtml(name)).append("\n");
        if (hasText(position)) sb.append("• <b>Position:</b> ").append(escapeHtml(position)).append("\n");
        if (hasText(phone))    sb.append("• <b>Phone:</b> ").append(escapeHtml(phone)).append("\n");
        if (hasText(email))    sb.append("• <b>Email:</b> ").append(escapeHtml(email)).append("\n");
        if (roles != null && !roles.isEmpty()) {
            sb.append("• <b>Roles:</b> ").append(escapeHtml(String.join(", ", roles))).append("\n");
        }
        return sb.toString();
    }

    public static String businessOwnerRegistered(String ownerName, String businessName,
                                                  String planName, String expiryDate) {
        return "🏢 <b>NEW BUSINESS OWNER REGISTERED</b>\n\n" +
                "• <b>Owner:</b> " + escapeHtml(ownerName) + "\n" +
                "• <b>Business:</b> " + escapeHtml(businessName) + "\n" +
                "• <b>Plan:</b> " + escapeHtml(planName) + "\n" +
                "• <b>Expiry Date:</b> " + escapeHtml(expiryDate);
    }

    public static String subscriptionExpiringSoon(String businessName, long daysRemaining, String expiryDate) {
        return "⚠️ <b>SUBSCRIPTION EXPIRING SOON</b>\n\n" +
                "• <b>Business:</b> " + escapeHtml(businessName) + "\n" +
                "• <b>Days Remaining:</b> " + daysRemaining + " day(s)\n" +
                "• <b>Expiry Date:</b> " + escapeHtml(expiryDate);
    }

    public static String subscriptionRenewed(String businessName, String planName, String newExpiryDate) {
        return "🎉 <b>SUBSCRIPTION RENEWED</b>\n\n" +
                "• <b>Business:</b> " + escapeHtml(businessName) + "\n" +
                "• <b>Plan:</b> " + escapeHtml(planName) + "\n" +
                "• <b>New Expiry:</b> " + escapeHtml(newExpiryDate);
    }

    public static String subscriptionCancelled(String businessName) {
        return "🚫 <b>SUBSCRIPTION CANCELLED</b>\n\n" +
                "• <b>Business:</b> " + escapeHtml(businessName);
    }

    public static String subscriptionPlanChanged(String businessName, String oldPlanName,
                                                  String newPlanName, String newExpiryDate) {
        return "🔄 <b>SUBSCRIPTION PLAN CHANGED</b>\n\n" +
                "• <b>Business:</b> " + escapeHtml(businessName) + "\n" +
                "• <b>Old Plan:</b> " + escapeHtml(oldPlanName) + "\n" +
                "• <b>New Plan:</b> " + escapeHtml(newPlanName) + "\n" +
                "• <b>New Expiry:</b> " + escapeHtml(newExpiryDate);
    }

    public static String testMessage() {
        return "✅ <b>TELEGRAM NOTIFICATION TEST</b>\n\n" +
                "Telegram order alert integration is active and running normally.";
    }

    public static String groupLinked(String businessName) {
        return "🔗 <b>TELEGRAM GROUP LINKED</b>\n\n" +
                "This group is now connected to <b>" + escapeHtml(businessName) + "</b> for live order alerts.";
    }

    // ── Clean Normal Responsive HTML Order Message ────────────────────────────────

    public static String buildCleanReceiptMessage(Order order) {
        return buildCleanReceiptMessage(order, "📄 <b>ORDER RECEIPT</b>");
    }

    public static String buildCleanReceiptMessage(Order order, String headerTitle) {
        StringBuilder sb = new StringBuilder();

        // 1. Header
        sb.append(headerTitle).append("\n\n");

        // 2. Order Metadata
        String fullOrderNum = order.getOrderNumber() != null ? order.getOrderNumber() : "";
        sb.append("• <b>Order ID:</b> <code>#").append(escapeHtml(fullOrderNum)).append("</code>\n");
        if (order.getCreatedAt() != null) {
            sb.append("• <b>Date/Time:</b> ").append(order.getCreatedAt().format(DATE_FMT)).append("\n");
        }
        if (order.getOrderStatus() != null) {
            sb.append("• <b>Status:</b> ").append(getStatusEmoji(order.getOrderStatus())).append(" <b>").append(order.getOrderStatus().name()).append("</b>\n");
        }
        if (hasText(order.getSource())) {
            sb.append("• <b>Source:</b> ").append(escapeHtml(order.getSource().toUpperCase())).append("\n");
        }

        // 3. Customer Info (only display if relevant customer data is present)
        if (hasText(order.getCustomerName()) || hasText(order.getCustomerPhone()) || (order.getDeliveryAddress() != null && hasText(formatAddress(order.getDeliveryAddress())))) {
            sb.append("\n👤 <b>Customer Info:</b>\n");
            if (hasText(order.getCustomerName())) {
                sb.append("• <b>Name:</b> ").append(escapeHtml(order.getCustomerName())).append("\n");
            }
            if (hasText(order.getCustomerPhone())) {
                sb.append("• <b>Contact:</b> ").append(escapeHtml(order.getCustomerPhone())).append("\n");
            }
            if (order.getDeliveryAddress() != null) {
                String addr = formatAddress(order.getDeliveryAddress());
                if (hasText(addr)) {
                    sb.append("• <b>Address:</b> ").append(escapeHtml(addr)).append("\n");
                }
            }
        }

        // 4. Order Items List
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            sb.append("\n🛒 <b>Ordered Items</b> (").append(order.getItems().size()).append(" item").append(order.getItems().size() > 1 ? "s" : "").append("):\n");
            int idx = 1;
            for (OrderItem item : order.getItems()) {
                String name = item.getProductName() != null ? item.getProductName() : "Product";
                BigDecimal lineTotal = item.getTotalPrice() != null ? item.getTotalPrice() :
                        (item.getFinalPrice() != null ? item.getFinalPrice().multiply(new BigDecimal(item.getQuantity())) : BigDecimal.ZERO);

                sb.append(idx++).append(". <b>").append(escapeHtml(name)).append("</b> × ").append(item.getQuantity())
                  .append(" — <b>$").append(fmt(lineTotal)).append("</b>\n");

                // Size info
                if (hasText(item.getSizeName()) && !"Standard".equalsIgnoreCase(item.getSizeName()) && !"null".equalsIgnoreCase(item.getSizeName())) {
                    sb.append("   <i>Size: ").append(escapeHtml(item.getSizeName())).append("</i>\n");
                }

                // Add-ons / Customizations
                Set<OrderItemCustomization> customs = item.getItemCustomizations();
                if (customs != null && !customs.isEmpty()) {
                    for (OrderItemCustomization c : customs) {
                        BigDecimal adj = c.getPriceAdjustment() != null ? c.getPriceAdjustment() : BigDecimal.ZERO;
                        sb.append("   <i>+ ").append(escapeHtml(c.getName()));
                        if (adj.compareTo(BigDecimal.ZERO) > 0) {
                            sb.append(" (+$").append(fmt(adj)).append(")");
                        }
                        sb.append("</i>\n");
                    }
                }
            }
        }

        // 5. Payment Summary
        sb.append("\n💳 <b>Payment Summary:</b>\n");
        if (order.getSubtotal() != null) {
            sb.append("• <b>Subtotal:</b> $").append(fmt(order.getSubtotal())).append("\n");
        }
        if (order.getCustomizationTotal() != null && order.getCustomizationTotal().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("• <b>Add-ons Total:</b> +$").append(fmt(order.getCustomizationTotal())).append("\n");
        }
        if ((order.getDeliveryFee() != null && order.getDeliveryFee().compareTo(BigDecimal.ZERO) > 0) || (order.getDeliveryOption() != null && order.getDeliveryOption().getPrice() != null && order.getDeliveryOption().getPrice().compareTo(BigDecimal.ZERO) > 0)) {
            String delLabel = order.getDeliveryOption() != null && hasText(order.getDeliveryOption().getName())
                    ? "Delivery (" + order.getDeliveryOption().getName() + ")"
                    : "Delivery Fee";
            BigDecimal delFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : order.getDeliveryOption().getPrice();
            sb.append("• <b>").append(escapeHtml(delLabel)).append(":</b> +$").append(fmt(delFee)).append("\n");
        }
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("• <b>Discount:</b> -$").append(fmt(order.getDiscountAmount())).append("\n");
        }

        String paymentMode = hasText(order.getCustomerPaymentMethod())
                ? order.getCustomerPaymentMethod()
                : (order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null);
        if (paymentMode != null) {
            String payStatus = order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "";
            sb.append("• <b>Payment Method:</b> ").append(escapeHtml(paymentMode));
            if (hasText(payStatus)) {
                sb.append(" (").append(escapeHtml(payStatus)).append(")");
            }
            sb.append("\n");
        }

        sb.append("------------------------------------------\n");
        if (order.getTotalAmount() != null) {
            sb.append("💰 <b>TOTAL AMOUNT:</b> <b>$").append(fmt(order.getTotalAmount())).append("</b>\n");
        }

        // Remarks / Notes
        if (hasText(order.getBusinessNote())) {
            String[] parts = order.getBusinessNote().split("\\|");
            Set<String> cleanParts = new LinkedHashSet<>();
            for (String p : parts) {
                String t = p.trim();
                if (hasText(t) && !t.startsWith("Discount Applied:")) {
                    cleanParts.add(t);
                }
            }
            if (!cleanParts.isEmpty()) {
                sb.append("\n📝 <b>Remarks:</b>\n");
                for (String cp : cleanParts) {
                    sb.append("• ").append(escapeHtml(cp)).append("\n");
                }
            }
        }

        return sb.toString();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private static String getStatusEmoji(OrderStatus status) {
        if (status == null) return "📌";
        switch (status) {
            case PENDING: return "🟡";
            case CONFIRMED: return "🔵";
            case COMPLETED: return "🟢";
            case CANCELLED: return "🔴";
            default: return "📌";
        }
    }

    private static String formatAddress(OrderDeliveryAddress a) {
        if (a == null) return "";
        List<String> parts = new ArrayList<>();
        if (hasText(a.getHouseNumber())) parts.add("House " + a.getHouseNumber());
        if (hasText(a.getStreetNumber())) parts.add("St " + a.getStreetNumber());
        if (hasText(a.getVillage())) parts.add(a.getVillage());
        if (hasText(a.getCommune())) parts.add(a.getCommune());
        if (hasText(a.getDistrict())) parts.add(a.getDistrict());
        if (hasText(a.getProvince())) parts.add(a.getProvince());
        return String.join(", ", parts);
    }

    private static String fmt(BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
