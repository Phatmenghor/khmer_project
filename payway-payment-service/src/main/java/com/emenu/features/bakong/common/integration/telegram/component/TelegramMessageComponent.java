package com.emenu.features.bakong.common.integration.telegram.component;

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

    // ── Functional Components ───────────────────────────────────────────

    public static String header(String icon, String title) {
        return icon + " <b>" + escapeHtml(title) + "</b>\n\n";
    }

    public static String metaField(String label, String value) {
        if (!hasText(value)) return "";
        return "• <b>" + escapeHtml(label) + ":</b> " + escapeHtml(value) + "\n";
    }

    public static String metaCodeField(String label, String codeValue) {
        if (!hasText(codeValue)) return "";
        return "• <b>" + escapeHtml(label) + ":</b> <code>" + escapeHtml(codeValue) + "</code>\n";
    }

    public static String metaStatusField(String label, String emoji, String statusText) {
        if (!hasText(statusText)) return "";
        return "• <b>" + escapeHtml(label) + ":</b> " + emoji + " <b>" + escapeHtml(statusText) + "</b>\n";
    }

    public static String metaTimeField(String label, LocalDateTime time) {
        String formatted = time != null ? time.format(DATE_FMT) : LocalDateTime.now().format(DATE_FMT);
        return "• <b>" + escapeHtml(label) + ":</b> " + formatted + "\n";
    }

    public static String sectionTitle(String icon, String title) {
        return "\n" + icon + " <b>" + escapeHtml(title) + ":</b>\n";
    }

    public static String divider() {
        return DIVIDER;
    }

    public static String totalLine(String label, BigDecimal amount) {
        return DIVIDER + "💰 <b>" + escapeHtml(label.toUpperCase()) + ":</b> <b>$" + fmt(amount) + "</b>\n";
    }

    public static String footerNote(String icon, String noteText) {
        if (!hasText(noteText)) return "";
        return "\n" + icon + " <i>" + escapeHtml(noteText) + "</i>\n";
    }

    public static String card(String sectionIcon, String sectionTitle, Map<String, String> fields) {
        if (fields == null || fields.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        sb.append(sectionTitle(sectionIcon, sectionTitle));
        fields.forEach((k, v) -> {
            if (hasText(v)) {
                sb.append(metaField(k, v));
            }
        });
        return sb.toString();
    }

    public static String fmt(BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }

    public static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    public static String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
