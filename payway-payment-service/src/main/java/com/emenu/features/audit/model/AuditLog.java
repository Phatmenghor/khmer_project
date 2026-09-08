package com.emenu.features.audit.model;

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
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AuditLog extends BaseUUIDEntity {

    @Column(name = "trace_id", length = 100)
    private String traceId;

    @Column(name = "client_ip", length = 100)
    private String clientIp;

    @Column(name = "api_key", length = 255)
    private String apiKey;

    @Column(name = "method", length = 10)
    private String method;

    @Column(name = "endpoint", length = 255)
    private String endpoint;

    @Column(name = "request_json", columnDefinition = "TEXT")
    private String requestJson;

    @Column(name = "response_json", columnDefinition = "TEXT")
    private String responseJson;

    @Column(name = "is_success")
    private Boolean isSuccess;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;
}
