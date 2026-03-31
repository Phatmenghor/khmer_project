package com.emenu.features.audit.controller;

import com.emenu.features.audit.dto.filter.AuditLogFilterDTO;
import com.emenu.features.audit.dto.response.AuditLogResponseDTO;
import com.emenu.features.audit.dto.response.AuditStatsResponseDTO;
import com.emenu.features.audit.service.AuditLogService;
import com.emenu.shared.dto.PaginationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping("/get-all")
    public ResponseEntity<PaginationResponse<AuditLogResponseDTO>> searchAuditLogs(@RequestBody AuditLogFilterDTO filter) {
        return ResponseEntity.ok(auditLogService.searchAuditLogs(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponseDTO> getAuditLogById(@PathVariable UUID id) {
        return ResponseEntity.ok(auditLogService.getAuditLogById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<AuditStatsResponseDTO> getAuditStats() {
        return ResponseEntity.ok(auditLogService.getAuditStats());
    }
}
