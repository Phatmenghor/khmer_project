package com.emenu.features.hr.service.impl;

import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.setting.repository.WorkScheduleTypeEnumRepository;
import com.emenu.features.hr.dto.filter.WorkScheduleFilterRequest;
import com.emenu.features.hr.dto.request.WorkScheduleCreateRequest;
import com.emenu.features.hr.dto.response.WorkScheduleResponse;
import com.emenu.features.hr.dto.update.WorkScheduleUpdateRequest;
import com.emenu.features.hr.mapper.WorkScheduleMapper;
import com.emenu.features.hr.models.WorkSchedule;
import com.emenu.features.hr.repository.WorkScheduleRepository;
import com.emenu.features.hr.service.WorkScheduleService;
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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkScheduleServiceImpl implements WorkScheduleService {

    private final WorkScheduleRepository repository;
    private final WorkScheduleTypeEnumRepository typeEnumRepository;
    private final WorkScheduleMapper mapper;
    private final PaginationMapper paginationMapper;
    private final UserMapper userMapper;

    @Override
    public WorkScheduleResponse create(WorkScheduleCreateRequest request) {
        WorkSchedule schedule = mapper.toEntity(request);
        schedule.setScheduleTypeEnum(request.getScheduleTypeEnumName());
        WorkSchedule savedSchedule = repository.save(schedule);
        log.info("Work schedule created successfully: id={}, userId={}", savedSchedule.getId(), request.getUserId());
        return enrichResponse(mapper.toResponse(savedSchedule), savedSchedule);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkScheduleResponse getById(UUID id) {
        WorkSchedule schedule = findScheduleById(id);
        return enrichResponse(mapper.toResponse(schedule), schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<WorkScheduleResponse> getAll(WorkScheduleFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(),
                filter.getSortBy(), filter.getSortDirection()
        );

        Page<WorkSchedule> page = repository.findWithFilters(
                filter.getBusinessId(), filter.getUserId(),
                filter.getSearch(), pageable
        );

        return paginationMapper.toPaginationResponse(page,
                schedules -> schedules.stream()
                        .map(s -> enrichResponse(mapper.toResponse(s), s))
                        .toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkScheduleResponse> getByUserId(UUID userId) {
        List<WorkSchedule> schedules = repository.findByUserIdAndIsDeletedFalse(userId);
        return schedules.stream()
                .map(s -> enrichResponse(mapper.toResponse(s), s))
                .toList();
    }

    @Override
    public WorkScheduleResponse update(UUID id, WorkScheduleUpdateRequest request) {
        WorkSchedule schedule = findScheduleById(id);
        schedule.setScheduleTypeEnum(request.getScheduleTypeEnumName());
        mapper.updateEntity(request, schedule);
        WorkSchedule updatedSchedule = repository.save(schedule);
        log.info("Work schedule updated successfully: id={}", id);
        return enrichResponse(mapper.toResponse(updatedSchedule), updatedSchedule);
    }

    @Override
    public WorkScheduleResponse delete(UUID id) {
        WorkSchedule schedule = findScheduleById(id);
        schedule.softDelete();
        schedule = repository.save(schedule);
        log.info("Work schedule deleted successfully: id={}", id);
        return enrichResponse(mapper.toResponse(schedule), schedule);
    }

    private WorkSchedule findScheduleById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work schedule not found"));
    }

    private WorkScheduleResponse enrichResponse(WorkScheduleResponse response, WorkSchedule schedule) {
        response.setUserInfo(userMapper.toUserBasicInfo(schedule.getUser()));
        return response;
    }
}