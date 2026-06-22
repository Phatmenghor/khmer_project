package com.emenu.config.security.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Registered API key record.
 *
 * <p>Each key belongs to a specific project (<code>projectCode</code>)
 * and optionally a <code>path</code> prefix (e.g. "b/123" or "owner").
 * When the filter resolves the key it populates an {@link ApiKeyContext}
 * into the request attributes so that the service layer can use
 * projectCode + path without any extra headers or form fields.</p>
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
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The raw key value sent in X-API-Key header */
    @Column(name = "api_key", nullable = false, length = 255)
    private String apiKey;

    /** e.g. "emenu", "ab", "xyz-app" */
    @Column(name = "project_code", nullable = false, length = 100)
    private String projectCode;

    /**
     * Optional sub-folder / business path.
     * e.g. "b/abc-123", "owner", "customer", "shared"
     * When null, the files go under projectCode/yyyy-MM-dd/
     */
    @Column(name = "path", nullable = true, length = 255)
    private String path;

    @Column(name = "label", length = 255)
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
