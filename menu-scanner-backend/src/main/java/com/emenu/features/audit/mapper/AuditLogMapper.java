package com.emenu.features.audit.mapper;

import com.emenu.features.audit.dto.helper.AuditLogCreateHelper;
import com.emenu.features.audit.dto.response.AuditLogResponseDTO;
import com.emenu.features.audit.models.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuditLogMapper {

    AuditLog createFromHelper(AuditLogCreateHelper helper);

    AuditLogResponseDTO toResponseDTO(AuditLog auditLog);

    default AuditLogCreateHelper buildAuditLogHelper(
            UUID userId, String userIdentifier, String userEmail, String userType,
            String httpMethod, String endpoint, String ipAddress,
            String userAgent, String requestParams, String requestBody,
            Integer statusCode, Long responseTimeMs, String errorMessage, String sessionId) {
        return AuditLogCreateHelper.builder()
                .userId(userId)
                .userIdentifier(userIdentifier)
                .userEmail(userEmail)
                .userType(userType)
                .httpMethod(httpMethod)
                .endpoint(endpoint)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .requestParams(requestParams)
                .requestBody(requestBody)
                .statusCode(statusCode)
                .responseTimeMs(responseTimeMs)
                .errorMessage(errorMessage)
                .sessionId(sessionId)
                .build();
    }
}
