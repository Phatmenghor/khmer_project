package com.emenu.features.telegram.util;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Fluent Composer for building custom formatted Telegram messages.
 */
public class TelegramMessageComposer {

    private final StringBuilder sb = new StringBuilder();

    public static TelegramMessageComposer create() {
        return new TelegramMessageComposer();
    }

    public TelegramMessageComposer header(String icon, String title) {
        sb.append(TelegramMessageComponent.header(icon, title));
        return this;
    }

    public TelegramMessageComposer field(String label, String value) {
        sb.append(TelegramMessageComponent.field(label, value));
        return this;
    }

    public TelegramMessageComposer codeField(String label, String value) {
        sb.append(TelegramMessageComponent.codeField(label, value));
        return this;
    }

    public TelegramMessageComposer amountField(String label, BigDecimal amount, String currency) {
        sb.append(TelegramMessageComponent.amountField(label, amount, currency));
        return this;
    }

    public TelegramMessageComposer statusField(String label, String icon, String status) {
        sb.append(TelegramMessageComponent.statusField(label, icon, status));
        return this;
    }

    public TelegramMessageComposer dateField(String label, LocalDateTime dateTime) {
        sb.append(TelegramMessageComponent.dateField(label, dateTime));
        return this;
    }

    public TelegramMessageComposer sectionHeader(String title) {
        sb.append(TelegramMessageComponent.sectionHeader(title));
        return this;
    }

    public TelegramMessageComposer mapFields(Map<String, String> data) {
        sb.append(TelegramMessageComponent.mapFields(data));
        return this;
    }

    public TelegramMessageComposer raw(String text) {
        sb.append(TelegramMessageComponent.raw(text));
        return this;
    }

    public TelegramMessageComposer divider() {
        sb.append(TelegramMessageComponent.DIVIDER);
        return this;
    }

    public String build() {
        return sb.toString();
    }
}
