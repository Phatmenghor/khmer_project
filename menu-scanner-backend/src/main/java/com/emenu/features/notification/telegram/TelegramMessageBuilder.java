package com.emenu.features.notification.telegram;

import com.emenu.enums.order.OrderStatus;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderDeliveryAddress;
import com.emenu.features.order.models.OrderItem;
import com.emenu.features.order.models.OrderItemCustomization;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class TelegramMessageBuilder {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");

    private TelegramMessageBuilder() {}

    public static String newCustomerOrder(Order order) {
        return buildCleanReceiptMessage(order);
    }

    public static String newPOSOrder(Order order) {
        return buildCleanReceiptMessage(order);
    }

    public static String orderStatusChanged(Order order) {
        return buildCleanReceiptMessage(order);
    }

    public static String newStaff(String name, String position, String phone,
                                   String email, List<String> roles) {
        final int w = 42;
        StringBuilder sb = new StringBuilder();
        sb.append("<pre>\n");
        sb.append("NEW STAFF ADDED\n");
        sb.append(solidLine(w)).append("\n");
        if (hasText(name))     sb.append(alignRow("Name:", name, w)).append("\n");
        if (hasText(position)) sb.append(alignRow("Position:", position, w)).append("\n");
        if (hasText(phone))    sb.append(alignRow("Phone:", phone, w)).append("\n");
        if (hasText(email))    sb.append(alignRow("Email:", email, w)).append("\n");
        if (roles != null && !roles.isEmpty()) {
            sb.append(alignRow("Roles:", String.join(", ", roles), w)).append("\n");
        }
        sb.append("</pre>");
        return sb.toString();
    }

    public static String businessOwnerRegistered(String ownerName, String businessName,
                                                  String planName, String expiryDate) {
        final int w = 42;
        return "<pre>\n" +
            "NEW BUSINESS OWNER REGISTERED\n" +
            solidLine(w) + "\n" +
            alignRow("Owner:", ownerName, w) + "\n" +
            alignRow("Business:", businessName, w) + "\n" +
            alignRow("Plan:", planName, w) + "\n" +
            alignRow("Expiry:", expiryDate, w) + "\n" +
            "</pre>";
    }

    public static String subscriptionExpiringSoon(String businessName, long daysRemaining, String expiryDate) {
        final int w = 42;
        return "<pre>\n" +
            "SUBSCRIPTION EXPIRING SOON\n" +
            solidLine(w) + "\n" +
            alignRow("Business:", businessName, w) + "\n" +
            alignRow("Days Remaining:", String.valueOf(daysRemaining), w) + "\n" +
            alignRow("Expiry:", expiryDate, w) + "\n" +
            "</pre>";
    }

    public static String subscriptionRenewed(String businessName, String planName, String newExpiryDate) {
        final int w = 42;
        return "<pre>\n" +
            "SUBSCRIPTION RENEWED\n" +
            solidLine(w) + "\n" +
            alignRow("Business:", businessName, w) + "\n" +
            alignRow("Plan:", planName, w) + "\n" +
            alignRow("New Expiry:", newExpiryDate, w) + "\n" +
            "</pre>";
    }

    public static String subscriptionCancelled(String businessName) {
        final int w = 42;
        return "<pre>\n" +
            "SUBSCRIPTION CANCELLED\n" +
            solidLine(w) + "\n" +
            alignRow("Business:", businessName, w) + "\n" +
            "</pre>";
    }

    public static String subscriptionPlanChanged(String businessName, String oldPlanName,
                                                  String newPlanName, String newExpiryDate) {
        final int w = 42;
        return "<pre>\n" +
            "SUBSCRIPTION PLAN CHANGED\n" +
            solidLine(w) + "\n" +
            alignRow("Business:", businessName, w) + "\n" +
            alignRow("Old Plan:", oldPlanName, w) + "\n" +
            alignRow("New Plan:", newPlanName, w) + "\n" +
            alignRow("New Expiry:", newExpiryDate, w) + "\n" +
            "</pre>";
    }

    public static String testMessage() {
        final int w = 42;
        return "<pre>\n" +
            "TEST MESSAGE\n" +
            solidLine(w) + "\n" +
            "Telegram monitoring is working.\n" +
            "You will receive order alerts.\n" +
            "</pre>";
    }

    public static String groupLinked(String businessName) {
        final int w = 42;
        return "<pre>\n" +
            "GROUP LINKED\n" +
            solidLine(w) + "\n" +
            "Monitoring: " + businessName + "\n" +
            "</pre>";
    }

    // ── Dynamic Width Monospaced Receipt ──────────────────────────────────────

    public static String buildCleanReceiptMessage(Order order) {
        int dynamicW = 42;
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProductName() != null) {
                    dynamicW = Math.max(dynamicW, Math.min(item.getProductName().length() + 22, 48));
                }
            }
        }
        final int lineW = dynamicW;
        final int qtyColW = 4;
        final int priceColW = 7;
        final int discColW = 6;
        final int totalColW = 7;
        final int itemColW = Math.max(12, lineW - (qtyColW + priceColW + discColW + totalColW));

        StringBuilder sb = new StringBuilder();
        sb.append("<pre>\n");

        // 1. Metadata Block
        String fullOrderNum = order.getOrderNumber() != null ? order.getOrderNumber() : "";
        sb.append(alignRow("TRANS ID:", fullOrderNum, lineW)).append("\n");
        if (order.getCreatedAt() != null) {
            sb.append(alignRow("DATE/TIME:", order.getCreatedAt().format(DATE_FMT), lineW)).append("\n");
        }
        if (hasText(order.getCustomerName())) {
            sb.append(alignRow("CUSTOMER:", order.getCustomerName(), lineW)).append("\n");
        }
        if (hasText(order.getCustomerPhone())) {
            sb.append(alignRow("CONTACT:", order.getCustomerPhone(), lineW)).append("\n");
        }
        if (order.getDeliveryAddress() != null) {
            String addr = formatAddress(order.getDeliveryAddress());
            if (hasText(addr)) {
                sb.append(alignRow("ADDRESS:", addr, lineW)).append("\n");
            }
        }
        if (hasText(order.getSource())) {
            sb.append(alignRow("SOURCE:", order.getSource().toUpperCase(), lineW)).append("\n");
        }
        if (order.getOrderStatus() != null) {
            sb.append(alignRow("STATUS:", order.getOrderStatus().name(), lineW)).append("\n");
        }

        sb.append(dashedLine(lineW)).append("\n");

        // 2. Items Table Header
        sb.append(padRight("ITEM", itemColW))
          .append(padLeft("QTY", qtyColW))
          .append(padLeft("PRICE", priceColW))
          .append(padLeft("DISC", discColW))
          .append(padLeft("TOTAL", totalColW)).append("\n");
        sb.append(dashedLine(lineW)).append("\n");

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            int idx = 1;
            for (OrderItem item : order.getItems()) {
                String name = item.getProductName() != null ? item.getProductName() : "Product";
                String title = idx++ + "." + name;

                BigDecimal lineTotal = item.getTotalPrice() != null ? item.getTotalPrice() :
                    (item.getFinalPrice() != null ? item.getFinalPrice().multiply(new BigDecimal(item.getQuantity())) : BigDecimal.ZERO);

                // Original Base Price before promotion discount
                BigDecimal displayOriginalPrice = item.getCurrentPrice() != null && item.getCurrentPrice().compareTo(BigDecimal.ZERO) > 0
                        ? item.getCurrentPrice()
                        : (item.getFinalPrice() != null ? item.getFinalPrice() : item.getUnitPrice());

                String discStr = "-";
                if (Boolean.TRUE.equals(item.getHasPromotion()) && item.getPromotionType() != null) {
                    discStr = "PERCENTAGE".equals(item.getPromotionType())
                            ? fmt(item.getPromotionValue()) + "%"
                            : "$" + fmt(item.getPromotionValue());
                }

                // Wrap item title smoothly for column
                List<String> titleLines = wrapText(title, itemColW);
                sb.append(padRight(titleLines.get(0), itemColW))
                  .append(padLeft(String.valueOf(item.getQuantity()), qtyColW))
                  .append(padLeft("$" + fmt(displayOriginalPrice), priceColW))
                  .append(padLeft(discStr, discColW))
                  .append(padLeft("$" + fmt(lineTotal), totalColW)).append("\n");

                for (int l = 1; l < titleLines.size(); l++) {
                    sb.append(padRight(titleLines.get(l), itemColW)).append("\n");
                }

                // Size Sub-row
                if (hasText(item.getSizeName()) && !"Standard".equalsIgnoreCase(item.getSizeName()) && !"null".equalsIgnoreCase(item.getSizeName())) {
                    sb.append("  (").append(item.getSizeName()).append(")\n");
                }

                // Add-ons Sub-rows
                Set<OrderItemCustomization> customs = item.getItemCustomizations();
                if (customs != null && !customs.isEmpty()) {
                    for (OrderItemCustomization c : customs) {
                        BigDecimal adj = c.getPriceAdjustment() != null ? c.getPriceAdjustment() : BigDecimal.ZERO;
                        sb.append("  + ").append(c.getName());
                        if (adj.compareTo(BigDecimal.ZERO) > 0) {
                            sb.append(" (+$").append(fmt(adj)).append(")");
                        }
                        sb.append("\n");
                    }
                }
            }
        }

        sb.append(dashedLine(lineW)).append("\n");

        // 3. Summary Breakdown
        if (order.getSubtotal() != null) {
            sb.append(alignRow("Subtotal", "$" + fmt(order.getSubtotal()), lineW)).append("\n");
        }
        if (order.getCustomizationTotal() != null && order.getCustomizationTotal().compareTo(BigDecimal.ZERO) > 0) {
            sb.append(alignRow("Add-ons", "+$" + fmt(order.getCustomizationTotal()), lineW)).append("\n");
        }
        if (order.getDeliveryFee() != null || order.getDeliveryOption() != null) {
            String delLabel = order.getDeliveryOption() != null && hasText(order.getDeliveryOption().getName())
                    ? "Delivery (" + order.getDeliveryOption().getName() + ")"
                    : "Delivery";
            BigDecimal delFee = order.getDeliveryFee() != null ? order.getDeliveryFee() :
                (order.getDeliveryOption() != null && order.getDeliveryOption().getPrice() != null ? order.getDeliveryOption().getPrice() : BigDecimal.ZERO);
            sb.append(alignRow(delLabel, "+$" + fmt(delFee), lineW)).append("\n");
        }
        if (order.getTaxAmount() != null || order.getTaxPercentage() != null) {
            String taxLabel = "Tax (" + (order.getTaxPercentage() != null ? fmt(order.getTaxPercentage()) : "0") + "%)";
            sb.append(alignRow(taxLabel, "+$" + fmt(order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO), lineW)).append("\n");
        }
        String paymentMode = hasText(order.getCustomerPaymentMethod())
                ? order.getCustomerPaymentMethod()
                : (order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null);
        if (paymentMode != null) {
            sb.append(alignRow("Payment Mode", paymentMode, lineW)).append("\n");
        }
        if (order.getPaymentStatus() != null) {
            sb.append(alignRow("Payment Status", order.getPaymentStatus().name(), lineW)).append("\n");
        }
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            String discLabel = "Discount";
            if (hasText(order.getDiscountType())) {
                discLabel = "PERCENTAGE".equalsIgnoreCase(order.getDiscountType()) ? "Discount (%)" : "Discount (Fixed)";
            }
            sb.append(alignRow(discLabel, "-$" + fmt(order.getDiscountAmount()), lineW)).append("\n");
        }

        sb.append(thickSolidLine(lineW)).append("\n");
        if (order.getTotalAmount() != null) {
            sb.append(alignRow("TOTAL AMOUNT", "$" + fmt(order.getTotalAmount()), lineW)).append("\n");
        }
        sb.append(thickSolidLine(lineW)).append("\n");

        // Notes & Remarks (Deduplicated)
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
                sb.append("Remarks:\n");
                for (String cp : cleanParts) {
                    sb.append("  • ").append(cp).append("\n");
                }
                sb.append(dashedLine(lineW)).append("\n");
            }
        }

        sb.append("</pre>");
        return sb.toString();
    }

    // ── Formatting Helpers ───────────────────────────────────────────────────

    private static String alignRow(String label, String value, int width) {
        if (value == null) value = "";
        int valLen = value.length();
        int labelLen = label.length();
        if (labelLen + valLen + 1 > width) {
            return label + " " + value;
        }
        int spaces = width - labelLen - valLen;
        return label + " ".repeat(Math.max(1, spaces)) + value;
    }

    private static String padRight(String s, int width) {
        if (s == null) s = "";
        if (s.length() >= width) return s.substring(0, width);
        return s + " ".repeat(width - s.length());
    }

    private static String padLeft(String s, int width) {
        if (s == null) s = "";
        if (s.length() >= width) return s.substring(0, width);
        return " ".repeat(width - s.length()) + s;
    }

    private static List<String> wrapText(String text, int width) {
        List<String> result = new ArrayList<>();
        if (text == null || text.isBlank()) {
            result.add("");
            return result;
        }

        String[] words = text.split("\\s+");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            if (currentLine.length() == 0) {
                if (word.length() <= width) {
                    currentLine.append(word);
                } else {
                    result.add(word.substring(0, width));
                    currentLine.append(word.substring(width));
                }
            } else if (currentLine.length() + 1 + word.length() <= width) {
                currentLine.append(" ").append(word);
            } else {
                result.add(currentLine.toString());
                currentLine = new StringBuilder(word);
            }
        }
        if (currentLine.length() > 0) {
            result.add(currentLine.toString());
        }
        return result;
    }

    private static String dashedLine(int width) {
        return "-".repeat(width);
    }

    private static String solidLine(int width) {
        return "_".repeat(width);
    }

    private static String thickSolidLine(int width) {
        return "=".repeat(width);
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
        if (amount == null) return "0";
        BigDecimal stripped = amount.stripTrailingZeros();
        if (stripped.scale() <= 0) {
            return stripped.toBigInteger().toString();
        }
        return String.format("%.2f", amount);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
