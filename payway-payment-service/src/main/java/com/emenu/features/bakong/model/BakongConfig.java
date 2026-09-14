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

@Entity
@Table(name = "bakong_configurations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BakongConfig extends BaseUUIDEntity {

    @Column(name = "config_name", nullable = false, unique = true, length = 100)
    private String configName;

    @Column(name = "api_url", nullable = false, length = 255)
    private String apiUrl;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "daily_rate_limit", nullable = false)
    private int dailyRateLimit;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;
}
