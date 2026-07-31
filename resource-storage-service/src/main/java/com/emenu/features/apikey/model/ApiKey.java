package com.emenu.features.apikey.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Registered API key record.
 *
 * <p>Each key belongs to a specific project (<code>projectCode</code>)
 * and a <code>pathStore</code> prefix (e.g. "b/123" or "owner").
 * When the filter resolves the key it populates an
 * {@link com.emenu.config.security.model.ApiKeyContext} into the request
 * attributes so that the service layer can use projectCode + path without
 * any extra headers or form fields.</p>
 */
@Entity
@Table(name = "api_keys", uniqueConstraints = @UniqueConstraint(columnNames = "api_key"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "project_code", nullable = false, length = 100)
    private String projectCode;

    /** The raw key value sent in X-API-Key header */
    @Column(name = "api_key", nullable = false, length = 255)
    private String apiKey;

    /**
     * Sub-folder / business path.
     * e.g. "b/abc-123", "owner", "customer", "shared"
     */
    @Column(name = "path_store", nullable = false, length = 255)
    private String pathStore;

    @Column(name = "label", nullable = false, length = 255)
    private String label;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
