package com.emenu.features.apikey.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "api_keys", uniqueConstraints = @UniqueConstraint(columnNames = "api_key"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey extends BaseUUIDEntity {

    @Column(name = "project_code", nullable = false, length = 100)
    private String projectCode;

    @Column(name = "api_key", nullable = false, length = 255)
    private String apiKey;

    @Column(name = "path_store", nullable = true, length = 255)
    private String pathStore;

    @Column(name = "label", nullable = false, length = 255)
    private String label;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
