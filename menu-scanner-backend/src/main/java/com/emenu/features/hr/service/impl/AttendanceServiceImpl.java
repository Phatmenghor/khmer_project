package com.emenu.features.hr.service.impl;

import com.emenu.enums.hr.AttendanceStatusEnum;
import com.emenu.enums.hr.CheckInType;
import com.emenu.exception.custom.BusinessValidationException;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.hr.dto.filter.AttendanceFilterRequest;
import com.emenu.features.hr.dto.helper.AttendanceCheckInCreateHelper;
import com.emenu.features.hr.dto.helper.AttendanceCreateHelper;
import com.emenu.features.hr.dto.request.AttendanceCheckInRequest;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final AttendanceMapper mapper;
    private final AttendanceCheckInMapper checkInMapper;
    private final PaginationMapper paginationMapper;
    private final UserMapper userMapper;

    @Override
    public AttendanceResponse checkIn(AttendanceCheckInRequest request, UUID userId, UUID businessId) {
        WorkSchedule schedule = findAndValidateSchedule(request.getWorkScheduleId(), userId);
        validateWorkDay(schedule);

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository
                .findByUserIdAndAttendanceDateAndIsDeletedFalse(userId, today)
                .orElseGet(() -> createNewAttendance(userId, businessId, request.getWorkScheduleId(), today));

        validateCheckInSequence(attendance, request.getCheckInType());

        AttendanceCheckInCreateHelper checkInHelper = AttendanceCheckInCreateHelper.builder()
                .checkInType(request.getCheckInType())
                .checkInTime(LocalDateTime.now())
                .latitude(request.getLatitude() != null ? BigDecimal.valueOf(request.getLatitude()) : null)
                .longitude(request.getLongitude() != null ? BigDecimal.valueOf(request.getLongitude()) : null)
                .remarks(request.getRemarks())
                .build();

        AttendanceCheckIn checkIn = checkInMapper.createFromHelper(checkInHelper);
        attendance.addCheckIn(checkIn);

        if (request.getCheckInType() == CheckInType.END) {
            calculateAttendanceStatus(attendance, schedule);
        } else {
            attendance.setStatus(AttendanceStatusEnum.PRESENT);
        }

        attendance = attendanceRepository.save(attendance);
        log.info("Attendance check-in recorded successfully: userId={}, type={}, status={}",
                userId, request.getCheckInType(), attendance.getStatus());

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

    private WorkSchedule findAndValidateSchedule(UUID workScheduleId, UUID userId) {
        if (workScheduleId != null) {
            WorkSchedule schedule = workScheduleRepository.findByIdAndIsDeletedFalse(workScheduleId)
                    .orElse(null);
            if (schedule != null) return schedule;
        }
        return workScheduleRepository.findByUserIdAndIsDeletedFalse(userId).stream()
                .findFirst()
                .orElse(null);
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
        AttendanceCreateHelper helper = AttendanceCreateHelper.builder()
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

        java.time.LocalTime expectedStartTime = (schedule != null && schedule.getStartTime() != null) ? schedule.getStartTime() : java.time.LocalTime.of(9, 0);
        java.time.LocalTime expectedEndTime = (schedule != null && schedule.getEndTime() != null) ? schedule.getEndTime() : java.time.LocalTime.of(17, 30);

        LocalDateTime expectedStart = LocalDateTime.of(attendance.getAttendanceDate(), expectedStartTime);
        boolean isLate = startTime.isAfter(expectedStart);

        long totalWorkMinutes = DateTimeUtils.calculateDurationMinutes(startTime, endTime);
        long expectedWorkMinutes = Duration.between(expectedStartTime, expectedEndTime).toMinutes();

        if (schedule != null && schedule.getBreakStartTime() != null && schedule.getBreakEndTime() != null) {
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

        log.info("Attendance status calculated: status={}, worked={}min, expected={}min, percentage={}",
                attendance.getStatus(), totalWorkMinutes, expectedWorkMinutes,
                StringFormatUtils.formatPercentage(workPercentage));
    }

    private AttendanceResponse enrichWithUserInfo(AttendanceResponse response, Attendance attendance) {
        if (attendance.getUser() != null) {
            response.setUserInfo(userMapper.toUserBasicInfo(attendance.getUser()));
        }
        return response;
    }
}
