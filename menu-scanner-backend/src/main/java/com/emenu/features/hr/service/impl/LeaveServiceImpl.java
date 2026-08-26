package com.emenu.features.hr.service.impl;

import com.emenu.enums.hr.LeaveSessionEnum;
import com.emenu.enums.hr.LeaveStatusEnum;
import com.emenu.exception.custom.BusinessValidationException;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.hr.dto.filter.LeaveFilterRequest;
import com.emenu.features.hr.dto.request.LeaveApprovalRequest;
import com.emenu.features.hr.dto.request.LeaveCreateRequest;
import com.emenu.features.hr.dto.response.LeaveBalanceResponse;
import com.emenu.features.hr.dto.response.LeaveResponse;
import com.emenu.features.hr.dto.response.LeaveStatusHistoryResponse;
import com.emenu.features.hr.dto.update.LeaveUpdateRequest;
import com.emenu.features.hr.mapper.LeaveMapper;
import com.emenu.features.hr.models.Leave;
import com.emenu.features.hr.models.LeaveStatusHistory;
import com.emenu.features.hr.repository.LeaveRepository;
import com.emenu.features.hr.repository.LeaveStatusHistoryRepository;
import com.emenu.features.hr.service.LeaveService;
import com.emenu.features.hr.specification.LeaveSpecification;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.features.counter.ReferenceNumberGenerator;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository repository;
    private final LeaveMapper mapper;
    private final PaginationMapper paginationMapper;
    private final UserMapper userMapper;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final LeaveStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final BusinessSettingRepository businessSettingRepository;

    @Override
    public LeaveResponse create(LeaveCreateRequest request, UUID userId, UUID businessId) {
        LeaveSessionEnum session = request.getLeaveSession() != null ? request.getLeaveSession() : LeaveSessionEnum.FULL_DAY;
        double rawDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        if (rawDays <= 0) {
            throw new BusinessValidationException("End date must be on or after start date");
        }

        double multiplier = (session == LeaveSessionEnum.MORNING_SESSION || session == LeaveSessionEnum.AFTERNOON_SESSION) ? 0.5 : 1.0;
        double totalDays = rawDays * multiplier;

        // Validate available leave balance before creating PENDING request
        validateAndDeductLeaveBalance(userId, businessId, request.getLeaveTypeEnum(), totalDays);

        Leave leave = mapper.toEntity(request);
        leave.setUserId(userId);
        leave.setBusinessId(businessId);
        leave.setLeaveSession(session);
        leave.setTotalDays(totalDays);
        leave.setStatus(LeaveStatusEnum.PENDING);

        String referenceNumber = referenceNumberGenerator.generateLeaveNumber(businessId);
        leave.setReferenceNumber(referenceNumber);

        Leave savedLeave = repository.save(leave);

        // Record initial PENDING status in history
        String applicantName = resolveUserName(userId);
        statusHistoryRepository.save(new LeaveStatusHistory(
                savedLeave.getId(), LeaveStatusEnum.PENDING,
                "Leave request submitted", userId, applicantName
        ));

        log.info("Leave request created successfully: id={}, userId={}, reference={}, days={}",
                savedLeave.getId(), userId, referenceNumber, totalDays);
        return enrichResponse(mapper.toResponse(savedLeave), savedLeave);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveResponse getById(UUID id) {
        Leave leave = findLeaveById(id);
        LeaveResponse response = enrichResponse(mapper.toResponse(leave), leave);
        response.setStatusHistory(loadHistory(id));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<LeaveResponse> getAll(LeaveFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(),
                filter.getSortBy(), filter.getSortDirection()
        );

        List<LeaveStatusEnum> leaveStatusEnums = (filter.getStatuses() != null && !filter.getStatuses().isEmpty())
                ? filter.getStatuses() : null;

        var spec = LeaveSpecification.findWithFilters(
                filter.getBusinessId(),
                filter.getUserId(),
                filter.getLeaveTypeEnum(),
                leaveStatusEnums,
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getSearch()
        );
        Page<Leave> page = repository.findAll(spec, pageable);

        return paginationMapper.toPaginationResponse(page,
                leaves -> leaves.stream()
                        .map(l -> enrichResponse(mapper.toResponse(l), l))
                        .toList());
    }

    @Override
    public LeaveResponse update(UUID id, LeaveUpdateRequest request) {
        Leave leave = findLeaveById(id);

        if (!leave.getStatus().isPending()) {
            throw new BusinessValidationException("Cannot update leave that is not pending");
        }

        mapper.updateEntity(request, leave);

        if (request.getLeaveSession() != null) {
            leave.setLeaveSession(request.getLeaveSession());
        }

        LeaveSessionEnum session = leave.getLeaveSession() != null ? leave.getLeaveSession() : LeaveSessionEnum.FULL_DAY;
        double rawDays = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        double multiplier = (session == LeaveSessionEnum.MORNING_SESSION || session == LeaveSessionEnum.AFTERNOON_SESSION) ? 0.5 : 1.0;
        leave.setTotalDays(rawDays * multiplier);

        Leave updatedLeave = repository.save(leave);
        log.info("Leave request updated successfully: id={}", id);
        return enrichResponse(mapper.toResponse(updatedLeave), updatedLeave);
    }

    @Override
    public LeaveResponse approve(UUID id, LeaveApprovalRequest request, UUID actionBy) {
        Leave leave = findLeaveById(id);

        if (!leave.getStatus().isPending()) {
            throw new BusinessValidationException("Leave is not pending approval");
        }

        leave.setStatus(request.getStatus());
        leave.setActionBy(actionBy);
        leave.setActionAt(LocalDateTime.now());
        leave.setActionNote(request.getActionNote());

        Leave processedLeave = repository.save(leave);

        // Record status change in history
        String managerName = resolveUserName(actionBy);
        statusHistoryRepository.save(new LeaveStatusHistory(
                processedLeave.getId(), request.getStatus(),
                request.getActionNote(), actionBy, managerName
        ));

        log.info("Leave request processed: id={}, status={}, actionBy={}", id, request.getStatus(), actionBy);
        LeaveResponse response = enrichResponse(mapper.toResponse(processedLeave), processedLeave);
        response.setStatusHistory(loadHistory(id));
        return response;
    }

    @Override
    public LeaveResponse delete(UUID id) {
        Leave leave = findLeaveById(id);
        leave.softDelete();
        leave = repository.save(leave);
        log.info("Leave request deleted successfully: id={}", id);
        return enrichResponse(mapper.toResponse(leave), leave);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveBalanceResponse getLeaveBalance(UUID userId, UUID businessId) {
        BusinessSetting setting = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElse(null);

        boolean enabled = setting == null || setting.getEnableLeaveManagement() == null || setting.getEnableLeaveManagement();

        double annualEntitlement = setting != null && setting.getAnnualLeaveDaysPerYear() != null ? setting.getAnnualLeaveDaysPerYear().doubleValue() : 18.0;
        double sickEntitlement = setting != null && setting.getSickLeaveDaysPerYear() != null ? setting.getSickLeaveDaysPerYear().doubleValue() : 10.0;
        double specialEntitlement = setting != null && setting.getSpecialLeaveDaysPerYear() != null ? setting.getSpecialLeaveDaysPerYear().doubleValue() : 5.0;

        LocalDate now = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(now.getYear(), 1, 1);
        LocalDate endOfYear = LocalDate.of(now.getYear(), 12, 31);
        List<LeaveStatusEnum> activeStatuses = List.of(LeaveStatusEnum.PENDING, LeaveStatusEnum.APPROVED);

        double annualUsed = repository.sumUsedLeaveDays(userId, businessId, "ANNUAL", activeStatuses, startOfYear, endOfYear);
        double sickUsed = repository.sumUsedLeaveDays(userId, businessId, "SICK", activeStatuses, startOfYear, endOfYear);
        double specialUsed = repository.sumUsedLeaveDays(userId, businessId, "SPECIAL", activeStatuses, startOfYear, endOfYear);

        return LeaveBalanceResponse.builder()
                .userId(userId)
                .businessId(businessId)
                .enableLeaveManagement(enabled)
                .annualEntitlement(annualEntitlement)
                .annualUsedAndPending(annualUsed)
                .annualAvailable(Math.max(0.0, annualEntitlement - annualUsed))
                .sickEntitlement(sickEntitlement)
                .sickUsedAndPending(sickUsed)
                .sickAvailable(Math.max(0.0, sickEntitlement - sickUsed))
                .specialEntitlement(specialEntitlement)
                .specialUsedAndPending(specialUsed)
                .specialAvailable(Math.max(0.0, specialEntitlement - specialUsed))
                .build();
    }

    // ---------- helpers ----------

    private void validateAndDeductLeaveBalance(UUID userId, UUID businessId, String leaveType, double requestedDays) {
        BusinessSetting setting = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElse(null);

        boolean enabled = setting == null || setting.getEnableLeaveManagement() == null || setting.getEnableLeaveManagement();
        if (!enabled) {
            return;
        }

        double entitlement;
        if ("ANNUAL".equalsIgnoreCase(leaveType)) {
            entitlement = setting != null && setting.getAnnualLeaveDaysPerYear() != null ? setting.getAnnualLeaveDaysPerYear().doubleValue() : 18.0;
        } else if ("SICK".equalsIgnoreCase(leaveType)) {
            entitlement = setting != null && setting.getSickLeaveDaysPerYear() != null ? setting.getSickLeaveDaysPerYear().doubleValue() : 10.0;
        } else if ("SPECIAL".equalsIgnoreCase(leaveType)) {
            entitlement = setting != null && setting.getSpecialLeaveDaysPerYear() != null ? setting.getSpecialLeaveDaysPerYear().doubleValue() : 5.0;
        } else {
            return; // Custom/Other leave types do not hard-cap balance
        }

        LocalDate now = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(now.getYear(), 1, 1);
        LocalDate endOfYear = LocalDate.of(now.getYear(), 12, 31);
        List<LeaveStatusEnum> activeStatuses = List.of(LeaveStatusEnum.PENDING, LeaveStatusEnum.APPROVED);

        double usedAndPending = repository.sumUsedLeaveDays(userId, businessId, leaveType.toUpperCase(), activeStatuses, startOfYear, endOfYear);
        double available = entitlement - usedAndPending;

        if (requestedDays > available) {
            throw new BusinessValidationException(String.format(
                    "Insufficient %s leave balance. Entitlement: %.1f days, Currently Used/Pending: %.1f days, Available: %.1f days, Requested: %.1f days.",
                    leaveType, entitlement, usedAndPending, available, requestedDays
            ));
        }
    }

    private Leave findLeaveById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found"));
    }

    private LeaveResponse enrichResponse(LeaveResponse response, Leave leave) {
        if (leave.getUser() != null) {
            response.setUserInfo(userMapper.toUserBasicInfo(leave.getUser()));
        }
        if (leave.getActionUser() != null) {
            response.setActionUserInfo(userMapper.toUserBasicInfo(leave.getActionUser()));
        }
        return response;
    }

    private List<LeaveStatusHistoryResponse> loadHistory(UUID leaveId) {
        return statusHistoryRepository.findByLeaveIdOrderByCreatedAtAsc(leaveId)
                .stream()
                .map(h -> LeaveStatusHistoryResponse.builder()
                        .id(h.getId())
                        .status(h.getStatus())
                        .note(h.getNote())
                        .changedByUserId(h.getChangedByUserId())
                        .changedByName(h.getChangedByName())
                        .changedAt(h.getCreatedAt())
                        .build())
                .toList();
    }

    private String resolveUserName(UUID userId) {
        if (userId == null) return "System";
        return userRepository.findById(userId)
                .map(u -> {
                    if (u.getProfile() == null) return "Unknown";
                    String first = u.getProfile().getFirstName() != null ? u.getProfile().getFirstName() : "";
                    String last = u.getProfile().getLastName() != null ? u.getProfile().getLastName() : "";
                    return (first + " " + last).trim();
                })
                .orElse("Unknown");
    }
}