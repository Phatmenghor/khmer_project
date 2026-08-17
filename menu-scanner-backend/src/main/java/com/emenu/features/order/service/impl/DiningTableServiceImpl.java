package com.emenu.features.order.service.impl;

import com.emenu.exception.BusinessException;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.features.order.dto.request.CreateTableRequest;
import com.emenu.features.order.dto.request.UpdateTableStatusRequest;
import com.emenu.features.order.dto.response.DiningTableResponse;
import com.emenu.enums.order.TableStatus;
import com.emenu.features.order.mapper.DiningTableMapper;
import com.emenu.features.order.models.DiningTable;
import com.emenu.features.order.models.TableSession;
import com.emenu.features.order.repository.DiningTableRepository;
import com.emenu.features.order.repository.TableSessionRepository;
import com.emenu.features.order.service.DiningTableService;
import com.emenu.features.order.specification.DiningTableSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.emenu.features.notification.telegram.service.TelegramNotificationService;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DiningTableServiceImpl implements DiningTableService {

    private final DiningTableRepository tableRepository;
    private final TableSessionRepository tableSessionRepository;
    private final DiningTableMapper diningTableMapper;
    private final WebSocketNotificationService webSocketNotificationService;
    private final TelegramNotificationService telegramNotificationService;

    @Override
    @Transactional(readOnly = true)
    public List<DiningTableResponse> getTablesByBusiness(UUID businessId, TableStatus statusFilter) {
        log.info("Fetch dining tables - businessId: {}, statusFilter: {}", businessId, statusFilter);

        Specification<DiningTable> spec = DiningTableSpecification.filterTables(businessId, statusFilter, null);
        List<DiningTable> tables = tableRepository.findAll(spec);
        List<DiningTableResponse> responses = diningTableMapper.toResponseList(tables);

        if (businessId == null) {
            return responses;
        }

        List<TableSession> activeSessions = tableSessionRepository.findByBusinessIdAndStatusIn(businessId, List.of("PENDING", "ACTIVE"));
        Map<UUID, TableSession> sessionByTableIdMap = new HashMap<>();
        Map<String, TableSession> sessionByTableNumberMap = new HashMap<>();

        for (TableSession s : activeSessions) {
            if (s.getTableId() != null) {
                sessionByTableIdMap.put(s.getTableId(), s);
            }
            if (s.getTableNumber() != null) {
                sessionByTableNumberMap.put(s.getTableNumber().trim().toLowerCase(), s);
            }
        }

        LocalDateTime now = LocalDateTime.now();

        for (DiningTableResponse res : responses) {
            TableSession s = sessionByTableIdMap.get(res.getId());
            if (s == null && res.getNumber() != null) {
                String cleanNum = res.getNumber().trim().toLowerCase();
                s = sessionByTableNumberMap.get(cleanNum);
                if (s == null) {
                    s = sessionByTableNumberMap.get("table " + cleanNum);
                }
            }

            if (s != null) {
                if (res.getStatus() == TableStatus.AVAILABLE) {
                    res.setStatus(TableStatus.OCCUPIED);
                }
                res.setActiveOrderId(s.getId());

                long mins = 0;
                if (s.getStartedAt() != null) {
                    mins = Math.max(0, Duration.between(s.getStartedAt(), now).toMinutes());
                }
                res.setSeatedMinutes(mins);

                int itemsCount = s.getTotalItems() != null ? s.getTotalItems() : (s.getItems() != null ? s.getItems().size() : 0);
                String itemsSummary = itemsCount + " " + (itemsCount == 1 ? "item" : "items");

                String cleanSessionNum = s.getSessionNumber() != null
                        ? s.getSessionNumber().replaceAll("(?i)^(SESS-?|Session\\s*)", "")
                        : "ORD-" + res.getNumber();

                DiningTableResponse.ActiveOrderInfo orderInfo = DiningTableResponse.ActiveOrderInfo.builder()
                        .orderId(s.getId())
                        .orderNumber(cleanSessionNum)
                        .totalAmount(s.getTotalAmount() != null ? s.getTotalAmount() : BigDecimal.ZERO)
                        .paymentStatus("UNPAID")
                        .itemsSummary(itemsSummary)
                        .createdAt(s.getStartedAt())
                        .build();

                res.setActiveOrder(orderInfo);
            }
        }

        return responses;
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

        if (request.getNumber() == null || request.getNumber().isBlank()) {
            throw BusinessException.badRequest("Table number or code is required");
        }

        String trimmedNum = request.getNumber().trim();
        if (tableRepository.existsByBusinessIdAndNumberAndIsDeletedFalse(businessId, trimmedNum)) {
            throw BusinessException.badRequest("Table with number '" + trimmedNum + "' already exists");
        }

        DiningTable table = diningTableMapper.toEntity(request);
        table.setBusinessId(businessId);
        table.setNumber(trimmedNum);
        if (table.getCapacity() == null || table.getCapacity() < 1) {
            table.setCapacity(1);
        }

        DiningTable saved = tableRepository.save(table);
        log.info("Created dining table - id: {}, number: {}", saved.getId(), saved.getNumber());

        try {
            webSocketNotificationService.notifyTableEvent(businessId, "TABLE_CREATED", Map.of(
                    "tableId", saved.getId().toString(),
                    "tableNumber", saved.getNumber()
            ));
        } catch (Exception e) {
            log.warn("Failed to send WS table event: {}", e.getMessage());
        }

        return diningTableMapper.toResponse(saved);
    }

    @Override
    public DiningTableResponse updateTableStatus(UUID businessId, UUID tableId, UpdateTableStatusRequest request) {
        log.info("Update table status - tableId: {}, status: {}", tableId, request.getStatus());

        DiningTable table = tableRepository.findByIdAndBusinessIdAndIsDeletedFalse(tableId, businessId)
                .orElseThrow(() -> BusinessException.notFound("Table not found: " + tableId));

        TableStatus targetStatus = request.getStatus();
        table.setStatus(targetStatus);

        if (targetStatus == TableStatus.OCCUPIED) {
            if (table.getSeatedAt() == null) {
                table.setSeatedAt(LocalDateTime.now());
            }
        } else if (targetStatus == TableStatus.AVAILABLE) {
            table.setSeatedAt(null);
            table.setActiveOrderId(null);

            // Close/Complete any active pending sessions for table if switching to AVAILABLE
            List<TableSession> activeSessions = tableSessionRepository.findByBusinessIdAndStatusIn(businessId, List.of("PENDING", "ACTIVE"));
            for (TableSession s : activeSessions) {
                if (tableId.equals(s.getTableId()) || (s.getTableNumber() != null && s.getTableNumber().equalsIgnoreCase(table.getNumber()))) {
                    s.setStatus("CLOSED");
                    s.setClosedAt(LocalDateTime.now());
                    tableSessionRepository.save(s);
                }
            }
        } else {
            // RESERVED or MAINTENANCE
            table.setSeatedAt(null);
        }

        DiningTable updated = tableRepository.save(table);

        try {
            webSocketNotificationService.notifyTableEvent(businessId, "TABLE_STATUS_UPDATED", Map.of(
                    "tableId", updated.getId().toString(),
                    "tableNumber", updated.getNumber(),
                    "status", updated.getStatus().name()
            ));
        } catch (Exception e) {
            log.warn("Failed to send WS table event: {}", e.getMessage());
        }

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

        // Complete any open active table sessions for this table
        List<TableSession> activeSessions = tableSessionRepository.findByBusinessIdAndStatusIn(businessId, List.of("PENDING", "ACTIVE"));
        for (TableSession s : activeSessions) {
            if (tableId.equals(s.getTableId()) || (s.getTableNumber() != null && s.getTableNumber().equalsIgnoreCase(table.getNumber()))) {
                s.setStatus("CLOSED");
                s.setClosedAt(LocalDateTime.now());
                tableSessionRepository.save(s);
            }
        }

        DiningTable updated = tableRepository.save(table);

        try {
            webSocketNotificationService.notifyTableEvent(businessId, "TABLE_RESET", Map.of(
                    "tableId", updated.getId().toString(),
                    "tableNumber", updated.getNumber(),
                    "status", "AVAILABLE"
            ));
            telegramNotificationService.notifyTableReset(businessId, updated.getNumber());
        } catch (Exception e) {
            log.warn("Failed to send notification for table reset: {}", e.getMessage());
        }

        return diningTableMapper.toResponse(updated);
    }

    @Override
    public void deleteTable(UUID businessId, UUID tableId) {
        log.info("Delete table - tableId: {}", tableId);

        DiningTable table = tableRepository.findByIdAndBusinessIdAndIsDeletedFalse(tableId, businessId)
                .orElseThrow(() -> BusinessException.notFound("Table not found: " + tableId));

        table.softDelete();
        tableRepository.save(table);

        try {
            webSocketNotificationService.notifyTableEvent(businessId, "TABLE_DELETED", Map.of(
                    "tableId", tableId.toString(),
                    "tableNumber", table.getNumber()
            ));
        } catch (Exception e) {
            log.warn("Failed to send WS table event: {}", e.getMessage());
        }
    }
}
