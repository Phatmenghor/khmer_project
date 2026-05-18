package com.emenu.features.audit.controller;

import com.emenu.features.audit.dto.filter.AuditLogFilterDTO;
import com.emenu.features.audit.dto.response.AuditLogResponseDTO;
import com.emenu.features.audit.dto.response.AuditStatsResponseDTO;
import com.emenu.features.audit.service.AuditLogService;
import com.emenu.shared.dto.PaginationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping("/get-all")
    public ResponseEntity<PaginationResponse<AuditLogResponseDTO>> searchAuditLogs(@RequestBody AuditLogFilterDTO filter) {
        log.info("Endpoint: search-audit-logs - audit logs retrieval request: page={}, size={}, userId={}, userType={}",
            filter.getPageNo(), filter.getPageSize(), filter.getUserId(), filter.getUserType());
        return ResponseEntity.ok(auditLogService.searchAuditLogs(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponseDTO> getAuditLogById(@PathVariable UUID id) {
        log.info("Endpoint: get-audit-log-by-id - audit log retrieval request: id={}", id);
        return ResponseEntity.ok(auditLogService.getAuditLogById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<AuditStatsResponseDTO> getAuditStats() {
        log.info("Endpoint: get-audit-stats - audit statistics retrieval request");
        return ResponseEntity.ok(auditLogService.getAuditStats());
    }
}
