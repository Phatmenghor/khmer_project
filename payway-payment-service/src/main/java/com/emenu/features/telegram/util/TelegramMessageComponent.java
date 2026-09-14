package com.emenu.features.telegram.util;

import com.emenu.util.TextUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Modular Reusable Functional Components for Telegram Receipt & Notification Messages.
 */
public final class TelegramMessageComponent {

    public static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");
    public static final String DIVIDER = "------------------------------------------\n";

    private TelegramMessageComponent() {}

    public static String header(String icon, String title) {
        String prefix = TextUtils.hasText(icon) ? (icon + " ") : "";
        return String.format("<b>%s%s</b>\n%s", prefix, TextUtils.escapeHtml(title).toUpperCase(), DIVIDER);
    }

    public static String field(String label, String value) {
        if (!TextUtils.hasText(value)) return "";
        return String.format("<b>%-16s:</b> %s\n", TextUtils.escapeHtml(label), TextUtils.escapeHtml(value));
    }

    public static String codeField(String label, String value) {
        if (!TextUtils.hasText(value)) return "";
        return String.format("<b>%-16s:</b> <code>%s</code>\n", TextUtils.escapeHtml(label), TextUtils.escapeHtml(value));
    }

    public static String amountField(String label, BigDecimal amount, String currency) {
        if (amount == null) return "";
        String curr = TextUtils.hasText(currency) ? currency : "USD";
        return String.format("<b>%-16s:</b> <b>%.2f %s</b>\n", TextUtils.escapeHtml(label), amount, TextUtils.escapeHtml(curr));
    }

    public static String statusField(String label, String icon, String status) {
        String prefix = TextUtils.hasText(icon) ? (icon + " ") : "";
        return String.format("<b>%-16s:</b> %s<b>%s</b>\n", TextUtils.escapeHtml(label), prefix, TextUtils.escapeHtml(status));
    }

    public static String dateField(String label, LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return String.format("<b>%-16s:</b> <code>%s</code>\n", TextUtils.escapeHtml(label), dateTime.format(DATE_FMT));
    }

    public static String sectionHeader(String title) {
        return String.format("\n<b>%s</b>\n", TextUtils.escapeHtml(title).toUpperCase());
    }

    public static String mapFields(Map<String, String> data) {
        if (data == null || data.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        data.forEach((k, v) -> {
            if (TextUtils.hasText(v)) {
                sb.append(field(k, v));
            }
        });
        return sb.toString();
    }

    public static String raw(String text) {
        return TextUtils.hasText(text) ? TextUtils.escapeHtml(text) : "";
    }
}
