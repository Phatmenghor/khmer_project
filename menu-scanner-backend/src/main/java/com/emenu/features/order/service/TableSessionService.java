package com.emenu.features.order.service;

import com.emenu.features.order.dto.filter.TableSessionFilterRequest;
import com.emenu.features.order.dto.request.AddTableSessionBatchItemsRequest;
import com.emenu.features.order.dto.request.AddTableSessionItemRequest;
import com.emenu.features.order.dto.request.SettleTableSessionRequest;
import com.emenu.features.order.dto.response.TableSessionResponse;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface TableSessionService {

    TableSessionResponse getActiveSessionByTableId(UUID tableId);

    TableSessionResponse getSessionById(UUID id);

    List<TableSessionResponse> getAllActiveSessions(UUID businessId);

    PaginationResponse<?> searchTableSessions(TableSessionFilterRequest filter);

    TableSessionResponse addItemToSession(UUID businessId, AddTableSessionItemRequest request);

    TableSessionResponse addBatchItemsToSession(UUID businessId, AddTableSessionBatchItemsRequest request);

    TableSessionResponse approveSession(UUID id, Integer round);

    TableSessionResponse settleSessionAndCreateOrder(UUID businessId, SettleTableSessionRequest request);

    void deleteSession(UUID id);
}
