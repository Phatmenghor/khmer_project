package com.emenu.features.audit.mapper;

import com.emenu.features.audit.dto.helper.AuditLogCreateHelper;
import com.emenu.features.audit.dto.response.AuditLogResponseDTO;
import com.emenu.features.audit.models.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuditLogMapper {

    AuditLog createFromHelper(AuditLogCreateHelper helper);

    AuditLogResponseDTO toResponseDTO(AuditLog auditLog);
}
