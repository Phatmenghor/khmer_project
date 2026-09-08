package com.emenu.features.audit.service.impl;

import com.emenu.features.audit.model.AuditLog;
import com.emenu.features.audit.repository.AuditLogRepository;
import com.emenu.features.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Async("taskExecutor")
    public void saveAuditLogAsync(AuditLog auditLog) {
        try {
            AuditLog saved = auditLogRepository.save(auditLog);
            log.info("Persisted AuditLog id={} traceId={} method={} endpoint={} success={}",
                    saved.getId(), saved.getTraceId(), saved.getMethod(), saved.getEndpoint(), saved.getIsSuccess());
        } catch (Exception e) {
            log.error("Failed to persist AuditLog for traceId={}: {}", auditLog.getTraceId(), e.getMessage(), e);
        }
    }
}
