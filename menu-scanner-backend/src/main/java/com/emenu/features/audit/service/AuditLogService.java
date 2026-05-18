package com.emenu.features.audit.service;

import com.emenu.features.audit.dto.filter.AuditLogFilterDTO;
import com.emenu.features.audit.dto.response.AuditLogResponseDTO;
import com.emenu.features.audit.dto.response.AuditStatsResponseDTO;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AuditLogService {

    PaginationResponse<AuditLogResponseDTO> searchAuditLogs(AuditLogFilterDTO filter);

    void logAccessWithBodies(HttpServletRequest request, int statusCode, long responseTimeMs,
                            String errorMessage, String requestBody);

    AuditStatsResponseDTO getAuditStats();

    AuditLogResponseDTO getAuditLogById(UUID id);
}
