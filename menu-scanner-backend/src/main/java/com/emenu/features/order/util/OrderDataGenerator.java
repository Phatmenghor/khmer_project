package com.emenu.features.order.util;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Complete Order Data Generator - All fields populated, no nulls
 * Supports CUSTOMER orders (from checkout) and BUSINESS orders (from admin)
 */
public class OrderDataGenerator {

    public enum OrderSource {
        CUSTOMER,  // From public checkout page
        BUSINESS   // From admin/POS system
    }

    public static Map<String, Object> generateCompleteOrder(OrderSource source) {
        Map<String, Object> order = new LinkedHashMap<>();

        // Core IDs
        order.put("id", UUID.randomUUID().toString());
        order.put("createdAt", LocalDateTime.now());
        order.put("updatedAt", LocalDateTime.now());
        order.put("createdBy", source == OrderSource.CUSTOMER ? "customer-user" : "admin-user");
        order.put("updatedBy", source == OrderSource.CUSTOMER ? "customer-user" : "admin-user");

        // Order Identification
        order.put("orderNumber", generateOrderNumber());
        order.put("orderFrom", source.name()); // CUSTOMER or BUSINESS

        // Customer Info
        order.put("customerId", UUID.randomUUID().toString());
        order.put("customerName", source == OrderSource.CUSTOMER ? "John Customer" : "Walk-in Customer");
        order.put("customerPhone", "+855 10 300 0001");
        order.put("customerEmail", source == OrderSource.CUSTOMER ? "customer@example.com" : "");

        // Business Info
        order.put("businessId", UUID.randomUUID().toString());
        order.put("businessName", "Phatmenghor Business");

        // Delivery Address
        order.put("deliveryAddress", generateDeliveryAddress());

        // Delivery Option
        order.put("deliveryOption", generateDeliveryOption());

        // Order Status
        order.put("orderStatus", "COMPLETED");
        order.put("orderStatusHistory", generateStatusHistory());

        // Notes
        order.put("customerNote", "Please prepare carefully");
        order.put("businessNote", "VIP customer - priority preparation");

        // Pricing
        order.put("pricing", generatePricing());

        // Payment
        order.put("payment", generatePayment());

        // Items
        order.put("items", generateOrderItems(6));

        // Additional Fields
        order.put("estimatedDeliveryTime", LocalDateTime.now().plusMinutes(30));
        order.put("actualDeliveryTime", LocalDateTime.now().plusMinutes(45));
        order.put("isSpecialOrder", false);
        order.put("isPriority", source == OrderSource.BUSINESS);
        order.put("source", source.name());
        order.put("deviceInfo", generateDeviceInfo(source));

        return order;
    }

    private static String generateOrderNumber() {
        return String.format("ORD-%s-WEB-%04d",
            LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")),
            new Random().nextInt(10000));
    }

    private static Map<String, Object> generateDeliveryAddress() {
        Map<String, Object> address = new LinkedHashMap<>();
        address.put("id", UUID.randomUUID().toString());
        address.put("village", "Village 1");
        address.put("commune", "Commune 1");
        address.put("district", "Toul Kork");
        address.put("province", "Phnom Penh");
        address.put("streetNumber", "Street 123");
        address.put("houseNumber", "House 456");
        address.put("landmark", "Near Central Market");
        address.put("note", "Ring doorbell twice");
        address.put("latitude", 11.5564);
        address.put("longitude", 104.9282);
        address.put("isDefault", true);
        address.put("addressType", "HOME");
        address.put("isActive", true);
        return address;
    }

    private static Map<String, Object> generateDeliveryOption() {
        Map<String, Object> option = new LinkedHashMap<>();
        option.put("id", UUID.randomUUID().toString());
        option.put("name", "Standard Delivery");
        option.put("description", "Delivery within 30-45 minutes");
        option.put("imageUrl", "https://cdn.example.com/delivery-standard.jpg");
        option.put("price", 2.0);
        option.put("estimatedMinutes", 30);
        option.put("estimatedMaxMinutes", 45);
        option.put("isActive", true);
        option.put("deliveryType", "STANDARD");
        return option;
    }

    private static List<Map<String, Object>> generateStatusHistory() {
        List<Map<String, Object>> history = new ArrayList<>();

        String[] statuses = {"PENDING", "CONFIRMED", "COMPLETED"};
        LocalDateTime currentTime = LocalDateTime.now();

        for (int i = 0; i < statuses.length; i++) {
            Map<String, Object> status = new LinkedHashMap<>();
            status.put("status", statuses[i]);
            status.put("changedAt", currentTime.minusMinutes(60 - (i * 30)));
            status.put("changedBy", i < 1 ? "system" : "staff-user");
            status.put("note", "Status updated to " + statuses[i]);
            history.add(status);
        }

        return history;
    }

    private static Map<String, Object> generatePricing() {
        Map<String, Object> pricing = new LinkedHashMap<>();

        // Before pricing
        Map<String, Object> before = new LinkedHashMap<>();
        before.put("totalItems", 6);
        before.put("subtotalBeforeDiscount", 364.0);
        before.put("subtotal", 364.0);
        before.put("totalDiscount", 0.0);
        before.put("deliveryFee", 2.0);
        before.put("taxAmount", 5.0);
        before.put("finalTotal", 371.0);

        // After pricing
        Map<String, Object> after = new LinkedHashMap<>();
        after.put("totalItems", 6);
        after.put("subtotalBeforeDiscount", 364.0);
        after.put("subtotal", 359.0);
        after.put("totalDiscount", 5.0);
        after.put("deliveryFee", 2.0);
        after.put("taxAmount", 5.0);
        after.put("finalTotal", 366.0);

        pricing.put("before", before);
        pricing.put("after", after);
        pricing.put("hadOrderLevelChangeFromPOS", false);
        pricing.put("reason", "");
        pricing.put("discountPercent", 1.4);
        pricing.put("taxPercent", 10.0);
        pricing.put("currency", "USD");

        return pricing;
    }

    private static Map<String, Object> generatePayment() {
        Map<String, Object> payment = new LinkedHashMap<>();
        payment.put("id", UUID.randomUUID().toString());
        payment.put("paymentMethod", "CASH");
        payment.put("paymentStatus", "PAID");
        payment.put("paidAmount", 366.0);
        payment.put("changeAmount", 34.0);
        payment.put("paymentDate", LocalDateTime.now());
        payment.put("transactionId", "TXN-" + UUID.randomUUID().toString().substring(0, 8));
        payment.put("notes", "Paid in cash at counter");
        return payment;
    }

    private static List<Map<String, Object>> generateOrderItems(int count) {
        List<Map<String, Object>> items = new ArrayList<>();

        String[] productNames = {
            "Chicken Fried Rice",
            "Beef Pad Thai",
            "Green Curry",
            "Spring Rolls",
            "Tom Yum Soup",
            "Mango Sticky Rice"
        };

        for (int i = 0; i < count; i++) {
            Map<String, Object> item = new LinkedHashMap<>();

            // Item ID
            item.put("id", UUID.randomUUID().toString());

            // Product Info
            Map<String, Object> product = new LinkedHashMap<>();
            product.put("id", UUID.randomUUID().toString());
            product.put("name", productNames[i % productNames.length]);
            product.put("imageUrl", "https://cdn.example.com/product-" + (i + 1) + ".jpg");
            product.put("sizeId", UUID.randomUUID().toString());
            product.put("sizeName", "Medium");
            product.put("status", "ACTIVE");
            product.put("category", "Main Course");
            item.put("product", product);

            // Before State
            Map<String, Object> before = new LinkedHashMap<>();
            before.put("currentPrice", 30.0 + (i * 5));
            before.put("finalPrice", 30.0 + (i * 5));
            before.put("hasActivePromotion", i % 2 == 0);
            before.put("quantity", 2);
            before.put("totalBeforeDiscount", (30.0 + (i * 5)) * 2);
            before.put("discountAmount", 0.0);
            before.put("totalPrice", (30.0 + (i * 5)) * 2);
            before.put("promotionType", i % 2 == 0 ? "PERCENTAGE" : "FIXED");
            before.put("promotionValue", i % 2 == 0 ? 10 : 5);
            before.put("promotionFromDate", LocalDateTime.now().minusDays(7));
            before.put("promotionToDate", LocalDateTime.now().plusDays(30));
            item.put("before", before);

            // After State (Usually null for CUSTOMER orders, filled for BUSINESS)
            item.put("hadChangeFromPOS", false);
            item.put("after", null);
            item.put("reason", "");

            // Additional Fields
            item.put("notes", "Well prepared, no onions");
            item.put("specialInstructions", "Extra sauce on the side");
            item.put("isAvailable", true);

            items.add(item);
        }

        return items;
    }

    private static Map<String, Object> generateDeviceInfo(OrderSource source) {
        Map<String, Object> device = new LinkedHashMap<>();

        if (source == OrderSource.CUSTOMER) {
            device.put("deviceType", "MOBILE");
            device.put("osType", "iOS");
            device.put("appVersion", "1.2.5");
            device.put("userAgent", "Mobile Safari iOS 17");
        } else {
            device.put("deviceType", "DESKTOP");
            device.put("osType", "Windows");
            device.put("appVersion", "2.0.0");
            device.put("userAgent", "POS System v2.0");
        }

        device.put("ipAddress", "192.168.1." + new Random().nextInt(256));
        device.put("timezone", "GMT+7");
        device.put("language", "km");

        return device;
    }

    // Main method for testing
    public static void main(String[] args) {
        // Generate CUSTOMER order
        Map<String, Object> customerOrder = generateCompleteOrder(OrderSource.CUSTOMER);
        System.out.println("CUSTOMER Order:");
        printJson(customerOrder);

        System.out.println("\n\n");

        // Generate BUSINESS order
        Map<String, Object> businessOrder = generateCompleteOrder(OrderSource.BUSINESS);
        System.out.println("BUSINESS Order:");
        printJson(businessOrder);
    }

    private static void printJson(Map<String, Object> obj) {
        System.out.println(convertToJson(obj, 0));
    }

    private static String convertToJson(Object obj, int indent) {
        String indentStr = "  ".repeat(indent);
        String nextIndentStr = "  ".repeat(indent + 1);

        if (obj instanceof Map) {
            StringBuilder sb = new StringBuilder("{\n");
            Map<String, Object> map = (Map<String, Object>) obj;
            List<String> keys = new ArrayList<>(map.keySet());

            for (int i = 0; i < keys.size(); i++) {
                String key = keys.get(i);
                Object value = map.get(key);
                sb.append(nextIndentStr).append("\"").append(key).append("\": ");

                if (value instanceof Map || value instanceof List) {
                    sb.append(convertToJson(value, indent + 1));
                } else if (value instanceof String) {
                    sb.append("\"").append(value).append("\"");
                } else if (value instanceof Number || value instanceof Boolean) {
                    sb.append(value);
                } else if (value == null) {
                    sb.append("null");
                } else {
                    sb.append("\"").append(value.toString()).append("\"");
                }

                if (i < keys.size() - 1) {
                    sb.append(",");
                }
                sb.append("\n");
            }
            sb.append(indentStr).append("}");
            return sb.toString();
        } else if (obj instanceof List) {
            StringBuilder sb = new StringBuilder("[\n");
            List<Object> list = (List<Object>) obj;

            for (int i = 0; i < list.size(); i++) {
                sb.append(nextIndentStr).append(convertToJson(list.get(i), indent + 1));
                if (i < list.size() - 1) {
                    sb.append(",");
                }
                sb.append("\n");
            }
            sb.append(indentStr).append("]");
            return sb.toString();
        } else {
            return obj.toString();
        }
    }
}
