package com.emenu.features.notification.telegram.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "telegram_message_logs")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelegramMessageLog extends BaseUUIDEntity {

    @Column(name = "business_id")
    private UUID businessId;

    @Column(name = "chat_id", nullable = false)
    private String chatId;

    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String messageText;

    @Column(name = "parse_mode")
    private String parseMode;

    @Column(name = "status")
    private String status; // "SUCCESS" or "FAILED"

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
