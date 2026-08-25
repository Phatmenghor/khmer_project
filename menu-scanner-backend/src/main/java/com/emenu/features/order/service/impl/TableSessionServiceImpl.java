package com.emenu.features.order.service.impl;

import com.emenu.enums.order.OrderFromEnum;
import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import java.math.RoundingMode;
import com.emenu.features.order.dto.filter.TableSessionFilterRequest;
import com.emenu.features.order.dto.request.AddTableSessionBatchItemsRequest;
import com.emenu.features.order.dto.request.AddTableSessionItemRequest;
import com.emenu.features.order.dto.request.SettleTableSessionRequest;
import com.emenu.features.order.dto.response.TableSessionResponse;
import com.emenu.features.order.mapper.TableSessionMapper;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderItem;
import com.emenu.features.order.models.TableSession;
import com.emenu.features.order.models.TableSessionItem;
import com.emenu.features.order.repository.OrderRepository;
import com.emenu.features.order.repository.TableSessionRepository;
import com.emenu.features.order.service.TableSessionService;
import com.emenu.features.order.specification.TableSessionSpecification;
import com.emenu.features.counter.ReferenceNumberGenerator;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TableSessionServiceImpl implements TableSessionService {

    private final TableSessionRepository tableSessionRepository;
    private final OrderRepository orderRepository;
    private final TableSessionMapper tableSessionMapper;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final PaginationMapper paginationMapper;
    private final TelegramNotificationService telegramNotificationService;
    private final WebSocketNotificationService webSocketNotificationService;
    private final BusinessSettingRepository businessSettingRepository;

    private TableSessionResponse enrichResponseWithBusinessTax(TableSessionResponse response, UUID businessId) {
        if (response == null || businessId == null) return response;
        BigDecimal taxRate = BigDecimal.ZERO;
        if (businessSettingRepository != null) {
            taxRate = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                    .map(s -> s.getTaxPercentage() != null ? BigDecimal.valueOf(s.getTaxPercentage()) : BigDecimal.ZERO)
                    .orElse(BigDecimal.ZERO);
        }

        BigDecimal subtotal = response.getSubtotal() != null ? response.getSubtotal() : BigDecimal.ZERO;
        BigDecimal custTotal = response.getCustomizationTotal() != null ? response.getCustomizationTotal() : BigDecimal.ZERO;
        BigDecimal taxableBase = subtotal.add(custTotal);

        BigDecimal taxAmount = taxableBase.multiply(taxRate).divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableBase.add(taxAmount);

        response.setTaxRate(taxRate);
        response.setTaxAmount(taxAmount);
        response.setDiscountAmount(BigDecimal.ZERO);
        response.setTotalAmount(taxableBase);
        response.setGrandTotal(grandTotal);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public TableSessionResponse getActiveSessionByTableId(UUID tableId) {
        log.info("Service: getActiveSessionByTableId - retrieving active table session: table_id={}", tableId);
        TableSession session = tableSessionRepository.findByTableIdAndStatusIn(tableId, List.of("PENDING", "ACTIVE"))
                .orElse(null);

        if (session == null) {
            log.info("Service: getActiveSessionByTableId - no active session found for table_id={}", tableId);
            return null;
        }

        log.info("Service: getActiveSessionByTableId - active session retrieved: session_number={}, total_items={}",
                session.getSessionNumber(), session.getItems() != null ? session.getItems().size() : 0);
        TableSessionResponse res = tableSessionMapper.toResponse(session);
        return enrichResponseWithBusinessTax(res, session.getBusinessId());
    }

    @Override
    @Transactional(readOnly = true)
    public TableSessionResponse getSessionById(UUID id) {
        log.info("Service: getSessionById - retrieving session by ID: id={}", id);
        TableSession session = tableSessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Table session not found with ID: " + id));
        TableSessionResponse res = tableSessionMapper.toResponse(session);
        return enrichResponseWithBusinessTax(res, session.getBusinessId());
    }

    @Override
    @Transactional
    public void deleteSession(UUID id) {
        log.info("Service: deleteSession - deleting session: id={}", id);
        tableSessionRepository.deleteById(id);
        log.info("Service: deleteSession - session deleted successfully: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableSessionResponse> getAllActiveSessions(UUID businessId) {
        log.info("Service: getAllActiveSessions - retrieving active sessions: businessId={}", businessId);
        List<TableSession> sessions = tableSessionRepository.findByBusinessIdAndStatus(businessId, "ACTIVE");
        log.info("Service: getAllActiveSessions - retrieved count={} active sessions", sessions.size());
        List<TableSessionResponse> list = tableSessionMapper.toResponseList(sessions);
        list.forEach(r -> enrichResponseWithBusinessTax(r, businessId));
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<?> searchTableSessions(TableSessionFilterRequest filter) {
        log.info("Service: searchTableSessions - searching table sessions: businessId={}, tableId={}, status={}, search={}",
                filter.getBusinessId(), filter.getTableId(), filter.getStatus(), filter.getSearch());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        UUID parsedTableId = filter.parseTableId();

        Specification<TableSession> spec = TableSessionSpecification.buildFilter(
                filter.getBusinessId(),
                parsedTableId,
                null,
                filter.getSearch()
        );

        Page<TableSession> page = tableSessionRepository.findAll(spec, pageable);
        List<TableSessionResponse> responseList = tableSessionMapper.toResponseList(page.getContent());
        responseList.forEach(r -> enrichResponseWithBusinessTax(r, filter.getBusinessId()));

        List<TableSessionResponse.TableSessionOrderRowResponse> allRoundRows = responseList.stream()
                .flatMap(s -> s.getRoundRows() != null ? s.getRoundRows().stream() : java.util.stream.Stream.empty())
                .filter(r -> {
                    if (filter.getStatus() == null || filter.getStatus().isBlank() || "ALL".equalsIgnoreCase(filter.getStatus())) {
                        return true;
                    }
                    return filter.getStatus().equalsIgnoreCase(r.getStatus());
                })
                .collect(Collectors.toList());

        int pageSize = filter.getPageSize() != null && filter.getPageSize() > 0 ? filter.getPageSize() : 10;
        int pageNo = filter.getPageNo() != null && filter.getPageNo() > 0 ? filter.getPageNo() : 1;
        int totalElements = allRoundRows.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        PaginationResponse<TableSessionResponse.TableSessionOrderRowResponse> paginationResponse = new PaginationResponse<>();
        paginationResponse.setContent(allRoundRows);
        paginationResponse.setPageNo(pageNo);
        paginationResponse.setPageSize(pageSize);
        paginationResponse.setTotalElements((long) totalElements);
        paginationResponse.setTotalPages(totalPages > 0 ? totalPages : 1);
        paginationResponse.setLast(true);

        log.info("Service: searchTableSessions - search returned count={} round rows, totalElements={}",
                allRoundRows.size(), totalElements);
        return paginationResponse;
    }

    @Override
    @Transactional
    public TableSessionResponse addItemToSession(UUID businessId, AddTableSessionItemRequest request) {
        AddTableSessionBatchItemsRequest batchRequest = AddTableSessionBatchItemsRequest.builder()
                .businessId(businessId)
                .tableId(request.getTableId())
                .tableNumber(request.getTableNumber())
                .orderRound(request.getOrderRound())
                .items(List.of(request))
                .build();
        return addBatchItemsToSession(businessId, batchRequest);
    }

    @Override
    @Transactional
    public TableSessionResponse addBatchItemsToSession(UUID businessId, AddTableSessionBatchItemsRequest request) {
        UUID tableUuid = request.parseTableId();
        List<AddTableSessionItemRequest> itemRequests = request.getItems();
        log.info("Service: addBatchItemsToSession - adding batch items: businessId={}, tableId={}, items_count={}",
                businessId, tableUuid, itemRequests != null ? itemRequests.size() : 0);

        if (itemRequests == null || itemRequests.isEmpty()) {
            throw new IllegalArgumentException("Items list cannot be empty");
        }

        TableSession session = tableSessionRepository.findByTableIdAndStatusIn(tableUuid, List.of("PENDING", "ACTIVE"))
                .orElseGet(() -> {
                    String tableNum = request.getTableNumber() != null && !request.getTableNumber().isBlank()
                            ? request.getTableNumber()
                            : (request.getTableId() != null ? "Table " + request.getTableId() : "Table " + tableUuid.toString().substring(0, 4));
                    String sessionNum = referenceNumberGenerator.generateSessionNumber(businessId, tableNum);
                    TableSession newSess = TableSession.builder()
                            .businessId(businessId)
                            .tableId(tableUuid)
                            .tableNumber(tableNum)
                            .sessionNumber(sessionNum)
                            .status("PENDING")
                            .startedAt(LocalDateTime.now())
                            .totalItems(0)
                            .subtotal(BigDecimal.ZERO)
                            .customizationTotal(BigDecimal.ZERO)
                            .totalAmount(BigDecimal.ZERO)
                            .items(new ArrayList<>())
                            .build();
                    log.info("Service: addBatchItemsToSession - created new pending session: session_number={}, table_number={}", sessionNum, tableNum);
                    return tableSessionRepository.save(newSess);
                });

        session.setStatus("PENDING");

        int itemRound;
        if (request.getOrderRound() != null && request.getOrderRound() > 0) {
            itemRound = request.getOrderRound();
        } else if (!session.getItems().isEmpty()) {
            int maxRound = session.getItems().stream()
                    .mapToInt(i -> i.getOrderRound() != null ? i.getOrderRound() : 1)
                    .max()
                    .orElse(0);
            itemRound = maxRound + 1;
        } else {
            itemRound = 1;
        }

        List<TableSessionItem> newItemsList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (AddTableSessionItemRequest itemReq : itemRequests) {
            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal custTotal = itemReq.getCustomizationTotal() != null ? itemReq.getCustomizationTotal() : BigDecimal.ZERO;
            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));

            String rawNote = itemReq.getCustomerNote();
            String cleanNote = (rawNote != null && !rawNote.trim().isEmpty()) ? rawNote.trim() : null;

            TableSessionItem item = TableSessionItem.builder()
                    .session(session)
                    .orderRound(itemRound)
                    .productId(itemReq.getProductId())
                    .productName(itemReq.getProductName())
                    .imageUrl(itemReq.getImageUrl())
                    .sizeId(itemReq.getSizeId())
                    .sizeName(itemReq.getSizeName())
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .customizationTotal(custTotal)
                    .totalPrice(totalPrice)
                    .status("PENDING")
                    .customerNote(cleanNote)
                    .build();

            session.getItems().add(item);
            newItemsList.add(item);
        }

        int totalItems = session.getItems().stream().mapToInt(TableSessionItem::getQuantity).sum();
        BigDecimal subtotal = session.getItems().stream()
                .map(i -> i.getTotalPrice() != null ? i.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal custTotal = session.getItems().stream()
                .map(i -> i.getCustomizationTotal() != null ? i.getCustomizationTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRate = BigDecimal.ZERO;
        if (businessSettingRepository != null && session.getBusinessId() != null) {
            taxRate = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(session.getBusinessId())
                    .map(s -> s.getTaxPercentage() != null ? BigDecimal.valueOf(s.getTaxPercentage()) : BigDecimal.ZERO)
                    .orElse(BigDecimal.ZERO);
        }

        BigDecimal taxableBase = subtotal.add(custTotal);
        BigDecimal taxAmount = taxableBase.multiply(taxRate).divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableBase.add(taxAmount);

        session.setTotalItems(totalItems);
        session.setSubtotal(subtotal);
        session.setCustomizationTotal(custTotal);
        session.setTaxPercentage(taxRate);
        session.setTaxAmount(taxAmount);
        session.setTotalAmount(grandTotal);

        TableSession saved = tableSessionRepository.save(session);
        log.info("Service: addBatchItemsToSession - items added successfull.y: session_number={}, round={}, total_items={}, total_amount={}",
                saved.getSessionNumber(), itemRound, saved.getTotalItems(), saved.getTotalAmount());

        try {
            telegramNotificationService.notifyTableSessionRoundAdded(saved, itemRound, newItemsList);
            if (saved.getBusinessId() != null) {
                webSocketNotificationService.notifyTableEvent(saved.getBusinessId(), "NEW_TABLE_ORDER", Map.of(
                        "tableId", saved.getTableId() != null ? saved.getTableId().toString() : "",
                        "tableNumber", saved.getTableNumber() != null ? saved.getTableNumber() : "",
                        "status", "OCCUPIED"
                ));
            }
        } catch (Exception e) {
            log.warn("Failed to send notification for table session round items: {}", e.getMessage());
        }

        return tableSessionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TableSessionResponse approveSession(UUID id, Integer round) {
        log.info("Service: approveSession - approving session: id={}, round={}", id, round);
        TableSession session = tableSessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Table session not found with ID: " + id));

        session.setStatus("ACTIVE");
        if (session.getItems() != null) {
            session.getItems().forEach(item -> {
                if ("PENDING".equalsIgnoreCase(item.getStatus())) {
                    if (round == null || (item.getOrderRound() != null && item.getOrderRound().equals(round))) {
                        item.setStatus("SERVED");
                    }
                }
            });
        }

        TableSession saved = tableSessionRepository.save(session);
        log.info("Service: approveSession - session round approved successfully: session_number={}, table_number={}, round={}",
                saved.getSessionNumber(), saved.getTableNumber(), round);

        try {
            webSocketNotificationService.notifyPlatformEvent("TABLE_SESSION_APPROVED", Map.of(
                    "sessionId", saved.getId().toString(),
                    "tableId", saved.getTableId().toString(),
                    "round", round != null ? round : 0,
                    "status", "ACTIVE"
            ));
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification for session approval: {}", e.getMessage());
        }

        return tableSessionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TableSessionResponse settleSessionAndCreateOrder(UUID businessId, SettleTableSessionRequest request) {
        UUID tableUuid = request.parseTableId();
        log.info("Service: settleSessionAndCreateOrder - settling session and creating consolidated order: businessId={}, tableId={}, rawTableId={}, payment_method={}",
                businessId, tableUuid, request.getTableId(), request.getPaymentMethod());

        TableSession session = tableSessionRepository.findByTableIdAndStatus(tableUuid, "ACTIVE")
                .orElseThrow(() -> new NotFoundException("No active dining session found for Table ID: " + request.getTableId()));

        Order order = new Order();
        order.setOrderNumber(referenceNumberGenerator.generateOrderNumber(businessId));
        order.setBusinessId(businessId);
        order.setCustomerName(request.getCustomerName() != null && !request.getCustomerName().isBlank()
                ? request.getCustomerName()
                : (session.getTableNumber() != null ? session.getTableNumber() : "Table " + request.getTableId()));
        order.setCustomerPhone("Table Service");
        order.setSource("TABLE_SESSION");
        order.setOrderFrom(OrderFromEnum.BUSINESS);
        order.setOrderStatus(OrderStatus.COMPLETED);

        PaymentMethod pm = PaymentMethod.CASH;
        try {
            if (request.getPaymentMethod() != null) {
                pm = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
            }
        } catch (Exception ignored) {}

        order.setPaymentMethod(pm);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setSubtotal(session.getSubtotal());
        order.setCustomizationTotal(session.getCustomizationTotal());
        order.setTotalAmount(session.getTotalAmount());
        order.setCompletedAt(LocalDateTime.now());
        order.setBusinessNote("Final Consolidated Table Session Order | Session: " + session.getSessionNumber() + " | Table: " + session.getTableNumber());

        Set<OrderItem> orderItems = new HashSet<>();
        if (session.getItems() != null) {
            for (TableSessionItem sessionItem : session.getItems()) {
                OrderItem oi = new OrderItem();
                oi.setOrder(order);
                oi.setProductId(sessionItem.getProductId());
                oi.setProductName(sessionItem.getProductName());
                oi.setProductSizeId(sessionItem.getSizeId());
                oi.setSizeName(sessionItem.getSizeName() != null ? sessionItem.getSizeName() : "Standard");
                oi.setQuantity(sessionItem.getQuantity());
                oi.setUnitPrice(sessionItem.getUnitPrice());
                oi.setFinalPrice(sessionItem.getUnitPrice());
                oi.setTotalPrice(sessionItem.getTotalPrice());
                oi.setCustomizationTotal(sessionItem.getCustomizationTotal());
                orderItems.add(oi);
            }
        }
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        log.info("Service: settleSessionAndCreateOrder - consolidated order saved: order_number={}, total_amount={}, items_count={}",
                savedOrder.getOrderNumber(), savedOrder.getTotalAmount(), orderItems.size());

        session.setStatus("CLOSED");
        session.setClosedAt(LocalDateTime.now());
        tableSessionRepository.save(session);
        log.info("Service: settleSessionAndCreateOrder - session closed successfully: session_number={}, table_number={}",
                session.getSessionNumber(), session.getTableNumber());

        try {
            webSocketNotificationService.notifyNewOrder(savedOrder);
            if (session.getBusinessId() != null) {
                webSocketNotificationService.notifyTableEvent(session.getBusinessId(), "TABLE_BILL_PAID", Map.of(
                        "tableId", session.getTableId() != null ? session.getTableId().toString() : "",
                        "tableNumber", session.getTableNumber() != null ? session.getTableNumber() : "",
                        "status", "AVAILABLE"
                ));
            }
            telegramNotificationService.notifyTableSessionSettled(session, savedOrder);
        } catch (Exception e) {
            log.warn("Failed to send notification for settled table session: {}", e.getMessage());
        }

        return tableSessionMapper.toResponse(session);
    }
}
