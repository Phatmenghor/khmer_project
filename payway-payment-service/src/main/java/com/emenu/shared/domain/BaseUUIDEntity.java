package com.emenu.shared.domain;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseUUIDEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Phnom_Penh"));
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now(ZoneId.of("Asia/Phnom_Penh"));
    }
}
