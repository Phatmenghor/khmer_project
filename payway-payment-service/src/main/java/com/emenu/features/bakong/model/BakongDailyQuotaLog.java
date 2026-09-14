package com.emenu.features.bakong.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(
    name = "bakong_daily_quota_logs",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"quota_date", "email"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BakongDailyQuotaLog extends BaseUUIDEntity {

    @Column(name = "quota_date", nullable = false)
    private LocalDate quotaDate;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "request_count", nullable = false)
    private int requestCount;

    @Column(name = "max_limit", nullable = false)
    private int maxLimit;

    @Column(name = "last_endpoint", length = 200)
    private String lastEndpoint;
}
