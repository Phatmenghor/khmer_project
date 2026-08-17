package com.emenu.features.order.service;

import com.emenu.features.order.dto.request.CreateTableRequest;
import com.emenu.features.order.dto.request.UpdateTableStatusRequest;
import com.emenu.features.order.dto.response.DiningTableResponse;
import com.emenu.enums.order.TableStatus;

import java.util.List;
import java.util.UUID;

public interface DiningTableService {
    List<DiningTableResponse> getTablesByBusiness(UUID businessId, TableStatus statusFilter);
    DiningTableResponse getTableById(UUID businessId, UUID tableId);
    DiningTableResponse createTable(UUID businessId, CreateTableRequest request);
    DiningTableResponse updateTableStatus(UUID businessId, UUID tableId, UpdateTableStatusRequest request);
    DiningTableResponse resetTable(UUID businessId, UUID tableId);
    void deleteTable(UUID businessId, UUID tableId);
}
