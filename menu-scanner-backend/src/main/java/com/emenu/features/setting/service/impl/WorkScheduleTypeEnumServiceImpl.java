package com.emenu.features.setting.service.impl;

import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.setting.dto.filter.ConfigEnumFilterRequest;
import com.emenu.features.setting.dto.request.WorkScheduleTypeEnumCreateRequest;
import com.emenu.features.setting.dto.response.WorkScheduleTypeEnumResponse;
import com.emenu.features.setting.dto.update.WorkScheduleTypeEnumUpdateRequest;
import com.emenu.features.setting.mapper.WorkScheduleTypeEnumMapper;
import com.emenu.features.setting.models.WorkScheduleTypeEnum;
import com.emenu.features.setting.repository.WorkScheduleTypeEnumRepository;
import com.emenu.features.setting.service.WorkScheduleTypeEnumService;
import com.emenu.features.setting.specification.WorkScheduleTypeEnumSpecification;
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
public class WorkScheduleTypeEnumServiceImpl implements WorkScheduleTypeEnumService {

    private final WorkScheduleTypeEnumRepository repository;
    private final WorkScheduleTypeEnumMapper mapper;
    private final PaginationMapper paginationMapper;

    @Override
    public WorkScheduleTypeEnumResponse create(WorkScheduleTypeEnumCreateRequest request) {
        boolean exists = repository.findByBusinessIdAndEnumNameAndIsDeletedFalse(
                request.getBusinessId(), request.getEnumName()).isPresent();

        if (exists) {
            throw new ValidationException(
                    "Enum name already exists for this business: " + request.getEnumName());
        }

        final WorkScheduleTypeEnum enumRecord = mapper.toEntity(request);
        WorkScheduleTypeEnum savedEnum = repository.save(enumRecord);
        log.info("Work schedule type created successfully: id={}, name={}", savedEnum.getId(), savedEnum.getEnumName());

        return mapper.toResponse(savedEnum);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkScheduleTypeEnumResponse getById(UUID id) {
        WorkScheduleTypeEnum enumRecord = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work schedule type enum not found"));
        return mapper.toResponse(enumRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<WorkScheduleTypeEnumResponse> getAll(ConfigEnumFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        var spec = WorkScheduleTypeEnumSpecification.findWithFilters(
                filter.getBusinessId(),
                filter.getSearch()
        );
        Page<WorkScheduleTypeEnum> page = repository.findAll(spec, pageable);

        return paginationMapper.toPaginationResponse(page,
                enums -> mapper.toResponseList(enums.stream().toList()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkScheduleTypeEnumResponse> getAllList(ConfigEnumFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        var spec = WorkScheduleTypeEnumSpecification.findWithFilters(
                filter.getBusinessId(),
                filter.getSearch()
        );
        Page<WorkScheduleTypeEnum> page = repository.findAll(spec, pageable);

        return mapper.toResponseList(page.getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkScheduleTypeEnumResponse> getByBusinessId(UUID businessId) {
        List<WorkScheduleTypeEnum> enums = repository.findByBusinessIdAndIsDeletedFalse(businessId);
        return mapper.toResponseList(enums);
    }

    @Override
    public WorkScheduleTypeEnumResponse update(UUID id, WorkScheduleTypeEnumUpdateRequest request) {
        final WorkScheduleTypeEnum enumRecord = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work schedule type enum not found"));

        if (request.getEnumName() != null) {
            final UUID businessId = enumRecord.getBusinessId();
            final String enumName = request.getEnumName();

            boolean exists = repository.findByBusinessIdAndEnumNameAndIsDeletedFalse(
                            businessId, enumName)
                    .filter(e -> !e.getId().equals(id))
                    .isPresent();

            if (exists) {
                throw new ValidationException(
                        "Enum name already exists for this business: " + enumName);
            }
        }

        mapper.updateEntity(request, enumRecord);
        WorkScheduleTypeEnum updatedEnum = repository.save(enumRecord);
        log.info("Work schedule type updated successfully: id={}", id);

        return mapper.toResponse(updatedEnum);
    }

    @Override
    public WorkScheduleTypeEnumResponse delete(UUID id) {
        WorkScheduleTypeEnum enumRecord = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work schedule type enum not found"));

        enumRecord.softDelete();
        enumRecord = repository.save(enumRecord);
        log.info("Work schedule type deleted successfully: id={}", id);
        return mapper.toResponse(enumRecord);
    }
}