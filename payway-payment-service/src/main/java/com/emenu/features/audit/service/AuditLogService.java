package com.emenu.features.audit.service;

import com.emenu.features.audit.model.AuditLog;

public interface AuditLogService {
    void saveAuditLogAsync(AuditLog auditLog);
}
