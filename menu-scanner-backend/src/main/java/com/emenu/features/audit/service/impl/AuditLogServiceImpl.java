package com.emenu.features.audit.service.impl;

import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.audit.dto.helper.AuditLogCreateHelper;
import com.emenu.features.audit.dto.filter.AuditLogFilterDTO;
import com.emenu.features.audit.dto.response.AuditLogResponseDTO;
import com.emenu.features.audit.dto.response.AuditStatsResponseDTO;
import com.emenu.features.audit.mapper.AuditLogMapper;
import com.emenu.features.audit.models.AuditLog;
import com.emenu.features.audit.repository.AuditLogRepository;
import com.emenu.features.audit.service.AuditLogService;
import com.emenu.security.SecurityUtils;
import com.emenu.security.jwt.JWTAuthenticationFilter;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.ClientIpUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<AuditLogResponseDTO> searchAuditLogs(AuditLogFilterDTO filter) {
        log.info("Audit logs search initiated: pageNo={}, pageSize={}, userId={}, userType={}",
            filter.getPageNo(), filter.getPageSize(), filter.getUserId(), filter.getUserType());

        Pageable pageable = PaginationUtils.createPageable(filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());

        Page<AuditLog> page = auditLogRepository.findAllWithFilters(
                filter.getUserId(),
                filter.getUserIdentifier(),
                filter.getUserType(),
                filter.getSearch(),
                pageable
        );

        List<AuditLogResponseDTO> content = page.getContent().stream()
                .map(auditLogMapper::toResponseDTO)
                .collect(Collectors.toList());

        log.info("Audit logs search completed: totalElements={}, totalPages={}, currentPage={}",
            page.getTotalElements(), page.getTotalPages(), filter.getPageNo());
        return paginationMapper.toPaginationResponse(page, content);
    }

    @Override
    public void logAccessWithBodies(HttpServletRequest request, int statusCode, long responseTimeMs,
                                   String errorMessage, String requestBody) {
        UUID userId = null;
        String userIdentifier = "anonymous";
        String userType = "ANONYMOUS";

        // Get authenticated user info from ThreadLocal (set by JWT filter)
        var authMap = JWTAuthenticationFilter.AUTHENTICATED_USER.get();
        String authUserId = authMap.get("userId");
        String authUserIdentifier = authMap.get("userIdentifier");
        String authUserType = authMap.get("userType");

        if (authUserIdentifier != null) {
            if (authUserId != null) {
                try {
                    userId = java.util.UUID.fromString(authUserId);
                } catch (Exception e) {
                    log.debug("Invalid userId format from token: {}", authUserId);
                }
            }
            userIdentifier = authUserIdentifier;
            userType = authUserType != null ? authUserType : "ANONYMOUS";
        }

        String httpMethod = request.getMethod();
        String endpoint = request.getRequestURI();
        String ipAddress = ClientIpUtils.getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String requestParams = !request.getParameterMap().isEmpty() ? buildParamsString(request.getParameterMap()) : null;
        String sessionId = null;
        try {
            sessionId = request.getSession(false) != null ? request.getSession().getId() : null;
        } catch (Exception e) {
            log.debug("Session not available for audit logging");
        }

        // Truncate request body if needed
        String truncatedRequestBody = null;
        if (requestBody != null && !requestBody.isEmpty()) {
            truncatedRequestBody = requestBody.length() > 10000 ?
                requestBody.substring(0, 10000) + "... [truncated]" : requestBody;
        }

        AuditLogCreateHelper helper = auditLogMapper.buildAuditLogHelper(
                userId, userIdentifier, userType, httpMethod, endpoint, ipAddress,
                userAgent, requestParams, truncatedRequestBody,
                statusCode, responseTimeMs, errorMessage, sessionId);

        saveAuditLogAsync(helper);
    }

    @Async
    @Transactional
    public void saveAuditLogAsync(AuditLogCreateHelper helper) {
        try {
            AuditLog auditLog = auditLogMapper.createFromHelper(helper);
            auditLogRepository.save(auditLog);
            log.info("Audit log saved successfully: endpoint={}, userIdentifier={}, statusCode={}, responseTime={}ms",
                helper.getEndpoint(), helper.getUserIdentifier(), helper.getStatusCode(), helper.getResponseTimeMs());
        } catch (Exception e) {
            log.error("Failed to save audit log: endpoint={}, error={}", helper.getEndpoint(), e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AuditStatsResponseDTO getAuditStats() {
        log.info("Audit statistics retrieval initiated");

        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);

        long totalLogs = auditLogRepository.count();
        long last24HoursCount = auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(
                last24Hours, LocalDateTime.now(), Pageable.unpaged()).getTotalElements();
        long last7DaysCount = auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(
                last7Days, LocalDateTime.now(), Pageable.unpaged()).getTotalElements();

        AuditStatsResponseDTO stats = new AuditStatsResponseDTO();
        stats.setTotalLogs(totalLogs);
        stats.setLast24Hours(last24HoursCount);
        stats.setLast7Days(last7DaysCount);

        log.info("Audit statistics retrieved: totalLogs={}, last24Hours={}, last7Days={}",
            totalLogs, last24HoursCount, last7DaysCount);
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogResponseDTO getAuditLogById(UUID id) {
        log.info("Audit log retrieval initiated: id={}", id);

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found with id: " + id));

        log.info("Audit log retrieved successfully: id={}, endpoint={}, userIdentifier={}",
            id, auditLog.getEndpoint(), auditLog.getUserIdentifier());
        return auditLogMapper.toResponseDTO(auditLog);
    }

    private String buildParamsString(Map<String, String[]> paramMap) {
        if (paramMap == null || paramMap.isEmpty()) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
            if (!sb.isEmpty()) {
                sb.append("&");
            }
            sb.append(entry.getKey()).append("=");
            if (entry.getValue() != null && entry.getValue().length > 0) {
                sb.append(String.join(",", entry.getValue()));
            }
        }

        String result = sb.toString();
        // Limit to 2000 chars
        return result.length() > 2000 ? result.substring(0, 2000) + "... [truncated]" : result;
    }
}
