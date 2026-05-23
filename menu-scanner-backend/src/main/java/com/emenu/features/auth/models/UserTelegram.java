package com.emenu.features.auth.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_telegrams", uniqueConstraints = {
        @UniqueConstraint(name = "uk_telegram_per_business", columnNames = {"telegram_id", "business_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(exclude = "user")
@NoArgsConstructor
@AllArgsConstructor
public class UserTelegram extends BaseUUIDEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "telegram_id")
    private Long telegramId;

    @Column(name = "business_id")
    private UUID businessId;

    @Column(name = "telegram_username")
    private String telegramUsername;

    @Column(name = "telegram_first_name")
    private String telegramFirstName;

    @Column(name = "telegram_last_name")
    private String telegramLastName;

    @Column(name = "telegram_photo_url")
    private String telegramPhotoUrl;

    @Column(name = "telegram_synced_at")
    private LocalDateTime telegramSyncedAt;
}
