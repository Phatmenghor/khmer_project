package com.emenu.features.hr.service.impl;

import com.emenu.enums.hr.AttendanceStatusEnum;
import com.emenu.enums.hr.CheckInType;
import com.emenu.enums.hr.ScanModeEnum;
import com.emenu.exception.custom.BusinessValidationException;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.counter.ReferenceNumberGenerator;
import com.emenu.features.hr.dto.filter.AttendanceFilterRequest;
import com.emenu.features.hr.dto.helper.AttendanceCheckInCreateHelper;
import com.emenu.features.hr.dto.helper.AttendanceCreateHelper;
import com.emenu.features.hr.dto.request.AttendanceCheckInRequest;
import com.emenu.features.hr.dto.response.AttendanceCheckInResponse;
import com.emenu.features.hr.dto.response.AttendanceResponse;
import com.emenu.features.hr.dto.update.AttendanceUpdateRequest;
import com.emenu.features.hr.mapper.AttendanceCheckInMapper;
import com.emenu.features.hr.mapper.AttendanceMapper;
import com.emenu.features.hr.models.Attendance;
import com.emenu.features.hr.models.AttendanceCheckIn;
import com.emenu.features.hr.models.WorkSchedule;
import com.emenu.features.hr.repository.AttendanceRepository;
import com.emenu.features.hr.repository.WorkScheduleRepository;
import com.emenu.features.hr.service.AttendanceService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.DateTimeUtils;
import com.emenu.shared.utils.StringFormatUtils;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.UserRepository;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final AttendanceMapper mapper;
    private final AttendanceCheckInMapper checkInMapper;
    private final PaginationMapper paginationMapper;
    private final UserMapper userMapper;

    @Override
    public AttendanceResponse checkIn(AttendanceCheckInRequest request, UUID currentUserId, UUID currentBusinessId) {
        UUID targetUserId = request.getUserId() != null ? request.getUserId() : currentUserId;
        UUID targetBusinessId = request.getBusinessId() != null ? request.getBusinessId() : currentBusinessId;
        WorkSchedule schedule = findAndValidateSchedule(request.getWorkScheduleId(), targetUserId, targetBusinessId);
        validateWorkDay(schedule);

        LocalDate today = LocalDate.now();
        UUID resolvedWorkScheduleId = (schedule != null) ? schedule.getId() : request.getWorkScheduleId();

        Attendance attendance = attendanceRepository
                .findByUserIdAndAttendanceDateAndIsDeletedFalse(targetUserId, today)
                .orElseGet(() -> createNewAttendance(targetUserId, targetBusinessId, resolvedWorkScheduleId, today));

        CheckInType effectiveType = request.getCheckInType();
        if (effectiveType == null) {
            int count = attendance.getCheckIns().size();
            if (count == 0) {
                effectiveType = CheckInType.START;
            } else if (count == 1) {
                effectiveType = CheckInType.END;
            } else {
                throw new BusinessValidationException("Attendance check-in/out already completed for today");
            }
        }

        validateCheckInSequence(attendance, effectiveType);

        LocalDateTime now = LocalDateTime.now();
        String checkInRef = referenceNumberGenerator.generateCheckInNumber(targetBusinessId);
        BigDecimal lat = request.getLatitude() != null ? BigDecimal.valueOf(request.getLatitude()) : BigDecimal.ZERO;
        BigDecimal lng = request.getLongitude() != null ? BigDecimal.valueOf(request.getLongitude()) : BigDecimal.ZERO;

        AttendanceCheckInCreateHelper checkInHelper = AttendanceCheckInCreateHelper.builder()
                .referenceNumber(checkInRef)
                .checkInType(effectiveType)
                .checkInTime(now)
                .latitude(lat)
                .longitude(lng)
                .remarks(request.getRemarks() != null ? request.getRemarks() : "Universal QR Check-In")
                .build();

        AttendanceCheckIn checkIn = checkInMapper.createFromHelper(checkInHelper);
        attendance.addCheckIn(checkIn);

        if (effectiveType == CheckInType.END) {
            calculateAttendanceStatus(attendance, schedule);
        } else {
            // Evaluate START clock-in strictly against assigned WorkSchedule
            if (schedule != null && schedule.getStartTime() != null) {
                LocalTime expectedStartTime = schedule.getStartTime();
                LocalDateTime expectedStart = LocalDateTime.of(today, expectedStartTime);

                if (now.isAfter(expectedStart)) {
                    attendance.setStatus(AttendanceStatusEnum.LATE);
                    long lateMinutes = Duration.between(expectedStart, now).toMinutes();
                    log.info("Attendance START check-in LATE: userId={}, schedule='{}', checkInTime={}, expectedStart={}, lateByMinutes={}",
                            targetUserId, schedule.getName(), now, expectedStart, lateMinutes);
                } else {
                    attendance.setStatus(AttendanceStatusEnum.PRESENT);
                    log.info("Attendance START check-in ON TIME: userId={}, schedule='{}', checkInTime={}, expectedStart={}",
                            targetUserId, schedule.getName(), now, expectedStart);
                }
            } else {
                attendance.setStatus(AttendanceStatusEnum.PRESENT);
                log.info("Attendance START check-in (No assigned work schedule start time): userId={}, checkInTime={}, status=PRESENT",
                        targetUserId, now);
            }
        }

        attendance = attendanceRepository.save(attendance);
        log.info("Attendance check-in recorded successfully: userId={}, type={}, status={}, checkInTime={}",
                targetUserId, effectiveType, attendance.getStatus(), now);

        return enrichWithUserInfo(mapper.toResponse(attendance), attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getById(UUID id) {
        Attendance attendance = findAttendanceById(id);
        return enrichWithUserInfo(mapper.toResponse(attendance), attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getTodayAttendance(UUID businessId) {
        LocalDate today = LocalDate.now();
        List<Attendance> todayList = attendanceRepository.findByBusinessIdAndAttendanceDateAndIsDeletedFalseOrderByCreatedAtDesc(businessId, today);
        log.info("Retrieved today's attendance logs from database: businessId={}, count={}", businessId, todayList.size());
        return todayList.stream()
                .map(att -> enrichWithUserInfo(mapper.toResponse(att), att))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<AttendanceResponse> getAll(AttendanceFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(),
                filter.getSortBy(), filter.getSortDirection()
        );

        Page<Attendance> page = attendanceRepository.findWithFilters(
                filter.getBusinessId(), filter.getUserId(), filter.getStatus(),
                filter.getStartDate(), filter.getEndDate(),
                filter.getSearch(), pageable
        );

        return paginationMapper.toPaginationResponse(page,
                attendances -> attendances.stream()
                        .map(att -> enrichWithUserInfo(mapper.toResponse(att), att))
                        .toList());
    }

    @Override
    @Transactional
    public void processDailyAbsences() {
        log.info("Starting scheduled midnight processDailyAbsences job for past dates (< 2 days)...");
        List<Business> businesses = businessRepository.findAllByIsDeletedFalse();
        if (businesses == null || businesses.isEmpty()) return;

        LocalDate today = LocalDate.now();
        List<LocalDate> pastDatesToProcess = List.of(today.minusDays(2), today.minusDays(1));

        for (Business bus : businesses) {
            UUID businessId = bus.getId();
            List<User> businessUsers = userRepository.findAllByBusinessIdAndIsDeletedFalse(businessId);
            if (businessUsers == null || businessUsers.isEmpty()) continue;

            for (LocalDate targetDate : pastDatesToProcess) {
                List<Attendance> existingLogs = attendanceRepository.findByBusinessIdAndAttendanceDateAndIsDeletedFalseOrderByCreatedAtDesc(businessId, targetDate);
                Set<UUID> scannedUserIds = existingLogs.stream()
                        .map(Attendance::getUserId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

                for (User user : businessUsers) {
                    if (!scannedUserIds.contains(user.getId())) {
                        try {
                            String attRef = referenceNumberGenerator.generateAttendanceNumber(businessId);
                            Attendance absentRecord = Attendance.builder()
                                    .referenceNumber(attRef)
                                    .userId(user.getId())
                                    .businessId(businessId)
                                    .attendanceDate(targetDate)
                                    .status(AttendanceStatusEnum.ABSENT)
                                    .build();
                            absentRecord.setUser(user);
                            attendanceRepository.save(absentRecord);
                            log.info("Auto-generated ABSENT attendance record: userId={}, businessId={}, date={}", user.getId(), businessId, targetDate);
                        } catch (Exception e) {
                            log.warn("Failed to auto-create ABSENT attendance for userId={}, date={}: {}", user.getId(), targetDate, e.getMessage());
                        }
                    }
                }
            }
        }
        log.info("Completed scheduled processDailyAbsences job successfully.");
    }

    @Override
    public AttendanceResponse update(UUID id, AttendanceUpdateRequest request) {
        Attendance attendance = findAttendanceById(id);
        mapper.updateEntity(request, attendance);
        attendance = attendanceRepository.save(attendance);
        log.info("Attendance updated successfully: id={}", id);
        return enrichWithUserInfo(mapper.toResponse(attendance), attendance);
    }

    @Override
    public AttendanceResponse delete(UUID id) {
        Attendance attendance = findAttendanceById(id);
        attendance.softDelete();
        attendance = attendanceRepository.save(attendance);
        log.info("Attendance deleted successfully: id={}", id);
        return enrichWithUserInfo(mapper.toResponse(attendance), attendance);
    }

    private Attendance findAttendanceById(UUID id) {
        return attendanceRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
    }

    private WorkSchedule findAndValidateSchedule(UUID workScheduleId, UUID userId, UUID businessId) {
        if (workScheduleId != null) {
            WorkSchedule schedule = workScheduleRepository.findByIdAndIsDeletedFalse(workScheduleId)
                    .orElse(null);
            if (schedule != null) return schedule;
        }
        WorkSchedule userSchedule = workScheduleRepository.findByUserIdAndIsDeletedFalse(userId).stream()
                .findFirst()
                .orElse(null);
        if (userSchedule != null) return userSchedule;

        if (businessId != null) {
            List<WorkSchedule> businessSchedules = workScheduleRepository.findByBusinessIdAndIsDeletedFalse(businessId);
            if (!businessSchedules.isEmpty()) {
                return businessSchedules.get(0);
            }
        }

        // Auto-create default WorkSchedule if none exists for this staff/business
        WorkSchedule autoSchedule = WorkSchedule.builder()
                .userId(userId)
                .businessId(businessId)
                .name("Default Work Schedule")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .enableCheckIn(true)
                .scanMode(ScanModeEnum.FULL_TIME)
                .workDays(Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY))
                .build();

        autoSchedule = workScheduleRepository.save(autoSchedule);
        log.info("Auto-created default WorkSchedule for userId={}: scheduleId='{}'", userId, autoSchedule.getId());
        return autoSchedule;
    }

    private void validateWorkDay(WorkSchedule schedule) {
        if (schedule == null || schedule.getWorkDays() == null || schedule.getWorkDays().isEmpty()) {
            return;
        }
        DayOfWeek dayOfWeek = LocalDate.now().getDayOfWeek();
        if (!schedule.getWorkDays().contains(dayOfWeek)) {
            log.info("Check-in on non-working day according to schedule: day={}", dayOfWeek);
        }
    }

    private Attendance createNewAttendance(UUID userId, UUID businessId, UUID workScheduleId, LocalDate date) {
        String attRef = referenceNumberGenerator.generateAttendanceNumber(businessId);
        AttendanceCreateHelper helper = AttendanceCreateHelper.builder()
                .referenceNumber(attRef)
                .userId(userId)
                .businessId(businessId)
                .workScheduleId(workScheduleId)
                .attendanceDate(date)
                .status(AttendanceStatusEnum.ABSENT)
                .build();
        return attendanceRepository.save(mapper.createFromHelper(helper));
    }

    private void validateCheckInSequence(Attendance attendance, CheckInType requestedType) {
        int currentCount = attendance.getCheckIns().size();
        boolean checkInExists = attendance.getCheckIns().stream()
                .anyMatch(c -> c.getCheckInType() == requestedType);

        if (checkInExists) {
            throw new BusinessValidationException("Already recorded check-in for: " + requestedType);
        }
        if (currentCount == 0 && requestedType != CheckInType.START) {
            throw new BusinessValidationException("Must clock in (START) first");
        }
        if (currentCount == 1 && requestedType != CheckInType.END) {
            throw new BusinessValidationException("Can only clock out (END) after clocking in");
        }
        if (currentCount >= 2) {
            throw new BusinessValidationException("Already completed check-in for today");
        }
    }

    private void calculateAttendanceStatus(Attendance attendance, WorkSchedule schedule) {
        AttendanceCheckIn startCheckIn = attendance.getCheckIns().stream()
                .filter(c -> c.getCheckInType() == CheckInType.START)
                .findFirst()
                .orElse(null);

        AttendanceCheckIn endCheckIn = attendance.getCheckIns().stream()
                .filter(c -> c.getCheckInType() == CheckInType.END)
                .findFirst()
                .orElse(null);

        if (startCheckIn == null || endCheckIn == null) {
            attendance.setStatus(AttendanceStatusEnum.PRESENT);
            return;
        }

        LocalDateTime startTime = startCheckIn.getCheckInTime();
        LocalDateTime endTime = endCheckIn.getCheckInTime();

        if (schedule == null || schedule.getStartTime() == null || schedule.getEndTime() == null) {
            attendance.setStatus(AttendanceStatusEnum.PRESENT);
            log.info("Attendance END shift status recorded without work schedule constraints: userId={}, status=PRESENT",
                    attendance.getUserId());
            return;
        }

        LocalTime expectedStartTime = schedule.getStartTime();
        LocalTime expectedEndTime = schedule.getEndTime();

        LocalDateTime expectedStart = LocalDateTime.of(attendance.getAttendanceDate(), expectedStartTime);
        boolean isLate = startTime.isAfter(expectedStart);

        long totalWorkMinutes = DateTimeUtils.calculateDurationMinutes(startTime, endTime);
        long expectedWorkMinutes = Duration.between(expectedStartTime, expectedEndTime).toMinutes();

        if (schedule.getBreakStartTime() != null && schedule.getBreakEndTime() != null) {
            long breakMinutes = Duration.between(schedule.getBreakStartTime(), schedule.getBreakEndTime()).toMinutes();
            totalWorkMinutes = Math.max(0, totalWorkMinutes - breakMinutes);
            expectedWorkMinutes = Math.max(1, expectedWorkMinutes - breakMinutes);
        }

        double workPercentage = DateTimeUtils.calculateWorkPercentage(totalWorkMinutes, expectedWorkMinutes);

        if (isLate) {
            attendance.setStatus(AttendanceStatusEnum.LATE);
        } else if (workPercentage < 60) {
            attendance.setStatus(AttendanceStatusEnum.HALF_DAY);
        } else {
            attendance.setStatus(AttendanceStatusEnum.PRESENT);
        }

        log.info("Attendance END shift status calculated from assigned schedule '{}': status={}, startTime={}, endTime={}, workedMinutes={}min, expectedMinutes={}min, workPercentage={}",
                schedule.getName(), attendance.getStatus(), startTime, endTime, totalWorkMinutes, expectedWorkMinutes,
                StringFormatUtils.formatPercentage(workPercentage));
    }

    private AttendanceResponse enrichWithUserInfo(AttendanceResponse response, Attendance attendance) {
        if (attendance.getUser() != null) {
            response.setUserInfo(userMapper.toUserBasicInfo(attendance.getUser()));
        }

        if (attendance.getCheckIns() != null && !attendance.getCheckIns().isEmpty()) {
            AttendanceCheckIn startCheck = attendance.getCheckIns().stream()
                    .filter(c -> c.getCheckInType() == CheckInType.START)
                    .findFirst()
                    .orElse(null);

            AttendanceCheckIn endCheck = attendance.getCheckIns().stream()
                    .filter(c -> c.getCheckInType() == CheckInType.END)
                    .findFirst()
                    .orElse(null);

            WorkSchedule schedule = attendance.getWorkSchedule();
            LocalTime expectedStart = (schedule != null && schedule.getStartTime() != null)
                    ? schedule.getStartTime() : LocalTime.of(9, 0);
            LocalTime expectedEnd = (schedule != null && schedule.getEndTime() != null)
                    ? schedule.getEndTime() : LocalTime.of(18, 0);

            if (startCheck != null && startCheck.getCheckInTime() != null) {
                LocalTime actualStartTime = startCheck.getCheckInTime().toLocalTime();
                if (actualStartTime.isAfter(expectedStart)) {
                    long lateMins = Duration.between(expectedStart, actualStartTime).toMinutes();
                    response.setLateMinutes(lateMins);
                } else {
                    response.setLateMinutes(0L);
                }
            }

            if (endCheck != null && endCheck.getCheckInTime() != null) {
                LocalTime actualEndTime = endCheck.getCheckInTime().toLocalTime();
                if (actualEndTime.isAfter(expectedEnd)) {
                    long overMins = Duration.between(expectedEnd, actualEndTime).toMinutes();
                    response.setOvertimeMinutes(overMins);
                    response.setEarlyLeaveMinutes(0L);
                } else if (actualEndTime.isBefore(expectedEnd)) {
                    long earlyMins = Duration.between(actualEndTime, expectedEnd).toMinutes();
                    response.setEarlyLeaveMinutes(earlyMins);
                    response.setOvertimeMinutes(0L);
                } else {
                    response.setOvertimeMinutes(0L);
                    response.setEarlyLeaveMinutes(0L);
                }
            }

            if (response.getCheckIns() != null && !response.getCheckIns().isEmpty()) {
                for (AttendanceCheckInResponse checkResp : response.getCheckIns()) {
                    if (checkResp.getCheckInType() == CheckInType.START && checkResp.getCheckInTime() != null) {
                        LocalTime actualStartTime = checkResp.getCheckInTime().toLocalTime();
                        if (actualStartTime.isAfter(expectedStart)) {
                            long lateMins = Duration.between(expectedStart, actualStartTime).toMinutes();
                            checkResp.setLateMinutes(lateMins);
                            checkResp.setIsLate(true);
                        } else {
                            checkResp.setLateMinutes(0L);
                            checkResp.setIsLate(false);
                        }
                    } else if (checkResp.getCheckInType() == CheckInType.END && checkResp.getCheckInTime() != null) {
                        LocalTime actualEndTime = checkResp.getCheckInTime().toLocalTime();
                        if (actualEndTime.isAfter(expectedEnd)) {
                            long overMins = Duration.between(expectedEnd, actualEndTime).toMinutes();
                            checkResp.setOvertimeMinutes(overMins);
                            checkResp.setIsOvertime(true);
                            checkResp.setIsEarly(false);
                            checkResp.setEarlyLeaveMinutes(0L);
                        } else if (actualEndTime.isBefore(expectedEnd)) {
                            long earlyMins = Duration.between(actualEndTime, expectedEnd).toMinutes();
                            checkResp.setEarlyLeaveMinutes(earlyMins);
                            checkResp.setIsEarly(true);
                            checkResp.setIsOvertime(false);
                            checkResp.setOvertimeMinutes(0L);
                        } else {
                            checkResp.setIsOvertime(false);
                            checkResp.setIsEarly(false);
                        }
                    }
                }
            }
        }

        return response;
    }
}
