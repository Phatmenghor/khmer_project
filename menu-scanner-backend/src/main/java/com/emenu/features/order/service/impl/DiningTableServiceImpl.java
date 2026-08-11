package com.emenu.features.order.service.impl;

import com.emenu.exception.BusinessException;
import com.emenu.features.order.dto.request.CreateTableRequest;
import com.emenu.features.order.dto.request.UpdateTableStatusRequest;
import com.emenu.features.order.dto.response.DiningTableResponse;
import com.emenu.features.order.enums.TableStatus;
import com.emenu.features.order.mapper.DiningTableMapper;
import com.emenu.features.order.models.DiningTable;
import com.emenu.features.order.repository.DiningTableRepository;
import com.emenu.features.order.service.DiningTableService;
import com.emenu.features.order.specification.DiningTableSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DiningTableServiceImpl implements DiningTableService {

    private final DiningTableRepository tableRepository;
    private final DiningTableMapper diningTableMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DiningTableResponse> getTablesByBusiness(UUID businessId, TableStatus statusFilter) {
        log.info("Fetch dining tables - businessId: {}, statusFilter: {}", businessId, statusFilter);
        
        Specification<DiningTable> spec = DiningTableSpecification.filterTables(businessId, statusFilter, null);
        List<DiningTable> tables = tableRepository.findAll(spec);

        return diningTableMapper.toResponseList(tables);
    }

    @Override
    @Transactional(readOnly = true)
    public DiningTableResponse getTableById(UUID businessId, UUID tableId) {
        log.info("Get table details - tableId: {}, businessId: {}", tableId, businessId);
        
        DiningTable table = tableRepository.findByIdAndBusinessIdAndIsDeletedFalse(tableId, businessId)
                .orElseThrow(() -> BusinessException.notFound("Table not found: " + tableId));

        return diningTableMapper.toResponse(table);
    }

    @Override
    public DiningTableResponse createTable(UUID businessId, CreateTableRequest request) {
        log.info("Create dining table - businessId: {}, number: {}, zone: {}", businessId, request.getNumber(), request.getZone());

        DiningTable table = diningTableMapper.toEntity(request);
        table.setBusinessId(businessId);

        DiningTable saved = tableRepository.save(table);
        log.info("Created dining table - id: {}, number: {}", saved.getId(), saved.getNumber());
        
        return diningTableMapper.toResponse(saved);
    }

    @Override
    public DiningTableResponse updateTableStatus(UUID businessId, UUID tableId, UpdateTableStatusRequest request) {
        log.info("Update table status - tableId: {}, status: {}", tableId, request.getStatus());
        
        DiningTable table = tableRepository.findByIdAndBusinessIdAndIsDeletedFalse(tableId, businessId)
                .orElseThrow(() -> BusinessException.notFound("Table not found: " + tableId));

        table.setStatus(request.getStatus());

        if (request.getStatus() == TableStatus.OCCUPIED && table.getSeatedAt() == null) {
            table.setSeatedAt(LocalDateTime.now());
        } else if (request.getStatus() == TableStatus.AVAILABLE) {
            table.setSeatedAt(null);
            table.setActiveOrderId(null);
        }

        DiningTable updated = tableRepository.save(table);
        return diningTableMapper.toResponse(updated);
    }

    @Override
    public DiningTableResponse resetTable(UUID businessId, UUID tableId) {
        log.info("Reset table - tableId: {}", tableId);
        
        DiningTable table = tableRepository.findByIdAndBusinessIdAndIsDeletedFalse(tableId, businessId)
                .orElseThrow(() -> BusinessException.notFound("Table not found: " + tableId));

        table.setStatus(TableStatus.AVAILABLE);
        table.setSeatedAt(null);
        table.setActiveOrderId(null);

        DiningTable updated = tableRepository.save(table);
        return diningTableMapper.toResponse(updated);
    }

    @Override
    public void deleteTable(UUID businessId, UUID tableId) {
        log.info("Delete table - tableId: {}", tableId);
        
        DiningTable table = tableRepository.findByIdAndBusinessIdAndIsDeletedFalse(tableId, businessId)
                .orElseThrow(() -> BusinessException.notFound("Table not found: " + tableId));

        table.softDelete();
        tableRepository.save(table);
    }
}
