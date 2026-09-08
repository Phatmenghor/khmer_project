package com.emenu.features.bakong.common.integration.telegram.component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Fluent Composer for Building Scalable, Fully Custom Telegram HTML Notification Messages.
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
        sb.append(TelegramMessageComponent.metaField(label, value));
        return this;
    }

    public TelegramMessageComposer codeField(String label, String codeValue) {
        sb.append(TelegramMessageComponent.metaCodeField(label, codeValue));
        return this;
    }

    public TelegramMessageComposer statusField(String label, String emoji, String statusText) {
        sb.append(TelegramMessageComponent.metaStatusField(label, emoji, statusText));
        return this;
    }

    public TelegramMessageComposer timeField(String label, LocalDateTime time) {
        sb.append(TelegramMessageComponent.metaTimeField(label, time));
        return this;
    }

    public TelegramMessageComposer section(String icon, String title) {
        sb.append(TelegramMessageComponent.sectionTitle(icon, title));
        return this;
    }

    public TelegramMessageComposer divider() {
        sb.append(TelegramMessageComponent.divider());
        return this;
    }

    public TelegramMessageComposer total(String label, BigDecimal amount) {
        sb.append(TelegramMessageComponent.totalLine(label, amount));
        return this;
    }

    public TelegramMessageComposer note(String icon, String noteText) {
        sb.append(TelegramMessageComponent.footerNote(icon, noteText));
        return this;
    }

    public TelegramMessageComposer raw(String rawContent) {
        if (rawContent != null) {
            sb.append(rawContent);
        }
        return this;
    }

    public String build() {
        return sb.toString();
    }
}
