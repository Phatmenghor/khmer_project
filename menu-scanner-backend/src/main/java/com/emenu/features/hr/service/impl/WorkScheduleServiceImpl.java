package com.emenu.features.hr.service.impl;

import com.emenu.enums.hr.ScanModeEnum;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.BusinessSettingDayShift;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.setting.repository.WorkScheduleTypeEnumRepository;
import com.emenu.features.hr.dto.common.DayShiftDto;
import com.emenu.features.hr.dto.filter.WorkScheduleFilterRequest;
import com.emenu.features.hr.dto.request.WorkScheduleCreateRequest;
import com.emenu.features.hr.dto.response.WorkScheduleResponse;
import com.emenu.features.hr.dto.update.WorkScheduleUpdateRequest;
import com.emenu.features.hr.mapper.WorkScheduleMapper;
import com.emenu.features.hr.models.WorkSchedule;
import com.emenu.features.hr.repository.WorkScheduleRepository;
import com.emenu.features.hr.service.WorkScheduleService;
import com.emenu.features.hr.specification.WorkScheduleSpecification;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkScheduleServiceImpl implements WorkScheduleService {

    private final WorkScheduleRepository repository;
    private final UserRepository userRepository;
    private final BusinessSettingRepository businessSettingRepository;
    private final WorkScheduleTypeEnumRepository typeEnumRepository;
    private final WorkScheduleMapper mapper;
    private final PaginationMapper paginationMapper;
    private final UserMapper userMapper;

    @Override
    public WorkScheduleResponse create(WorkScheduleCreateRequest request) {
        log.info("Creating work schedule: name={}, userId={}, businessId={}, dayShiftsCount={}",
                request.getName(), request.getUserId(), request.getBusinessId(), request.getDayShifts() != null ? request.getDayShifts().size() : 0);

        BusinessSetting businessSetting = null;
        if (request.getBusinessId() != null) {
            businessSetting = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(request.getBusinessId()).orElse(null);
        }

        Boolean enableCheckIn = request.getEnableCheckIn() != null ? request.getEnableCheckIn()
                : (businessSetting != null && businessSetting.getEnableCheckIn() != null ? businessSetting.getEnableCheckIn() : true);

        ScanModeEnum scanMode = request.getScanMode() != null ? request.getScanMode()
                : (businessSetting != null && businessSetting.getScanMode() != null ? businessSetting.getScanMode() : ScanModeEnum.FULL_TIME);

        WorkSchedule schedule = mapper.toEntity(request);
        schedule.setEnableCheckIn(enableCheckIn);
        schedule.setScanMode(scanMode);

        if (request.getDayShifts() == null || request.getDayShifts().isEmpty()) {
            List<DayShiftDto> generatedDtos = new ArrayList<>();
            if (businessSetting != null && businessSetting.getDefaultDayShifts() != null && !businessSetting.getDefaultDayShifts().isEmpty()) {
                for (BusinessSettingDayShift ds : businessSetting.getDefaultDayShifts()) {
                    generatedDtos.add(DayShiftDto.builder()
                            .dayOfWeek(ds.getDayOfWeek())
                            .enabled(ds.getEnabled())
                            .startTime(ds.getStartTime())
                            .endTime(ds.getEndTime())
                            .breakStartTime(ds.getBreakStartTime())
                            .breakEndTime(ds.getBreakEndTime())
                            .enableCheckIn(enableCheckIn)
                            .scanMode(scanMode)
                            .build());
                }
            } else {
                for (DayOfWeek day : DayOfWeek.values()) {
                    boolean enabled = day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY;
                    generatedDtos.add(DayShiftDto.builder()
                            .dayOfWeek(day)
                            .enabled(enabled)
                            .startTime(LocalTime.of(8, 0))
                            .endTime(LocalTime.of(18, 0))
                            .breakStartTime(LocalTime.of(12, 0))
                            .breakEndTime(LocalTime.of(13, 0))
                            .enableCheckIn(enableCheckIn)
                            .scanMode(scanMode)
                            .build());
                }
            }
            request.setDayShifts(generatedDtos);
        }

        List<WorkSchedule.WorkScheduleDayShift> shifts = request.getDayShifts().stream()
                .map(dto -> WorkSchedule.WorkScheduleDayShift.builder()
                        .dayOfWeek(dto.getDayOfWeek())
                        .enabled(dto.getEnabled())
                        .startTime(dto.getStartTime())
                        .endTime(dto.getEndTime())
                        .breakStartTime(dto.getBreakStartTime())
                        .breakEndTime(dto.getBreakEndTime())
                        .enableCheckIn(dto.getEnableCheckIn() != null ? dto.getEnableCheckIn() : enableCheckIn)
                        .scanMode(dto.getScanMode() != null ? dto.getScanMode() : scanMode)
                        .build())
                .toList();
        schedule.setDayShifts(new ArrayList<>(shifts));

        // Derive internal entity columns from dayShifts
        populateInternalEntityFields(schedule, request.getDayShifts());

        WorkSchedule savedSchedule = repository.save(schedule);
        log.info("Work schedule created successfully: id={}, name={}, userId={}", savedSchedule.getId(), savedSchedule.getName(), request.getUserId());
        return enrichResponse(mapper.toResponse(savedSchedule), savedSchedule);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkScheduleResponse getById(UUID id) {
        log.info("Fetching work schedule by ID: id={}", id);
        WorkSchedule schedule = findScheduleById(id);
        return enrichResponse(mapper.toResponse(schedule), schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<WorkScheduleResponse> getAll(WorkScheduleFilterRequest filter) {
        log.info("Fetching work schedule list: pageNo={}, pageSize={}, businessId={}, userId={}",
                filter.getPageNo(), filter.getPageSize(), filter.getBusinessId(), filter.getUserId());
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(),
                filter.getSortBy(), filter.getSortDirection()
        );

        var spec = WorkScheduleSpecification.findWithFilters(
                filter.getBusinessId(),
                filter.getUserId(),
                filter.getSearch()
        );
        Page<WorkSchedule> page = repository.findAll(spec, pageable);

        return paginationMapper.toPaginationResponse(page,
                schedules -> schedules.stream()
                        .map(s -> enrichResponse(mapper.toResponse(s), s))
                        .toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkScheduleResponse> getByUserId(UUID userId) {
        log.info("Fetching work schedules by user ID: userId={}", userId);
        List<WorkSchedule> schedules = repository.findByUserIdAndIsDeletedFalse(userId);
        return schedules.stream()
                .map(s -> enrichResponse(mapper.toResponse(s), s))
                .toList();
    }

    @Override
    public WorkScheduleResponse update(UUID id, WorkScheduleUpdateRequest request) {
        log.info("Updating work schedule: id={}, name={}, dayShiftsCount={}",
                id, request.getName(), request.getDayShifts() != null ? request.getDayShifts().size() : 0);
        WorkSchedule schedule = findScheduleById(id);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            schedule.setName(request.getName().trim());
        }

        if (request.getEnableCheckIn() != null) {
            schedule.setEnableCheckIn(request.getEnableCheckIn());
        }

        if (request.getScanMode() != null) {
            schedule.setScanMode(request.getScanMode());
        }

        if (request.getDayShifts() != null) {
            Boolean defaultEnableCheckIn = schedule.getEnableCheckIn();
            ScanModeEnum defaultScanMode = schedule.getScanMode();

            List<WorkSchedule.WorkScheduleDayShift> shifts = request.getDayShifts().stream()
                    .map(dto -> WorkSchedule.WorkScheduleDayShift.builder()
                            .dayOfWeek(dto.getDayOfWeek())
                            .enabled(dto.getEnabled())
                            .startTime(dto.getStartTime())
                            .endTime(dto.getEndTime())
                            .breakStartTime(dto.getBreakStartTime())
                            .breakEndTime(dto.getBreakEndTime())
                            .enableCheckIn(dto.getEnableCheckIn() != null ? dto.getEnableCheckIn() : defaultEnableCheckIn)
                            .scanMode(dto.getScanMode() != null ? dto.getScanMode() : defaultScanMode)
                            .build())
                    .toList();

            if (schedule.getDayShifts() == null) {
                schedule.setDayShifts(new ArrayList<>(shifts));
            } else {
                schedule.getDayShifts().clear();
                schedule.getDayShifts().addAll(shifts);
            }

            // Derive internal entity columns from dayShifts
            populateInternalEntityFields(schedule, request.getDayShifts());
        }

        WorkSchedule updatedSchedule = repository.save(schedule);
        log.info("Work schedule updated successfully: id={}, name={}, dayShiftsCount={}",
                id, updatedSchedule.getName(), request.getDayShifts() != null ? request.getDayShifts().size() : 0);
        return enrichResponse(mapper.toResponse(updatedSchedule), updatedSchedule);
    }

    @Override
    public WorkScheduleResponse delete(UUID id) {
        log.info("Deleting work schedule: id={}", id);
        WorkSchedule schedule = findScheduleById(id);
        schedule.softDelete();
        schedule = repository.save(schedule);
        log.info("Work schedule deleted successfully: id={}", id);
        return enrichResponse(mapper.toResponse(schedule), schedule);
    }

    private void populateInternalEntityFields(WorkSchedule schedule, List<DayShiftDto> dayShifts) {
        Set<DayOfWeek> workDaysSet = new HashSet<>();
        DayShiftDto firstActive = null;

        for (DayShiftDto dto : dayShifts) {
            if (Boolean.TRUE.equals(dto.getEnabled())) {
                workDaysSet.add(dto.getDayOfWeek());
                if (firstActive == null) {
                    firstActive = dto;
                }
            }
        }
        schedule.setWorkDays(workDaysSet);

        if (firstActive != null) {
            if (firstActive.getStartTime() != null) schedule.setStartTime(firstActive.getStartTime());
            if (firstActive.getEndTime() != null) schedule.setEndTime(firstActive.getEndTime());
            schedule.setBreakStartTime(firstActive.getBreakStartTime());
            schedule.setBreakEndTime(firstActive.getBreakEndTime());
        } else if (schedule.getStartTime() == null) {
            schedule.setStartTime(LocalTime.of(8, 0));
            schedule.setEndTime(LocalTime.of(18, 0));
        }
    }

    private WorkSchedule findScheduleById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work schedule not found"));
    }

    private WorkScheduleResponse enrichResponse(WorkScheduleResponse response, WorkSchedule schedule) {
        if (schedule.getUserId() != null) {
            userRepository.findById(schedule.getUserId()).ifPresent(user -> {
                response.setUserInfo(userMapper.toUserBasicInfo(user));
            });
        } else if (schedule.getUser() != null) {
            response.setUserInfo(userMapper.toUserBasicInfo(schedule.getUser()));
        }

        response.setEnableCheckIn(schedule.getEnableCheckIn());
        response.setScanMode(schedule.getScanMode());

        if (schedule.getDayShifts() != null && !schedule.getDayShifts().isEmpty()) {
            List<DayShiftDto> dtos = schedule.getDayShifts().stream()
                    .map(s -> DayShiftDto.builder()
                            .dayOfWeek(s.getDayOfWeek())
                            .enabled(s.getEnabled())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .breakStartTime(s.getBreakStartTime())
                            .breakEndTime(s.getBreakEndTime())
                            .enableCheckIn(s.getEnableCheckIn())
                            .scanMode(s.getScanMode())
                            .build())
                    .toList();
            response.setDayShifts(dtos);
        }

        return response;
    }
}