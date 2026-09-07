package com.emenu.features.bakong.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "bakong_token_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BakongTokenLog extends BaseUUIDEntity {

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "token", columnDefinition = "TEXT")
    private String token;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
