package com.emenu.features.order.service;

import com.emenu.enums.common.Status;
import com.emenu.features.order.dto.filter.PaymentOptionFilterRequest;
import com.emenu.features.order.dto.request.PaymentOptionRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.shared.dto.PaginationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

import com.emenu.shared.dto.BatchImportResponse;

public interface PaymentOptionService {

    PaymentOptionResponse createPaymentOption(UUID businessId, PaymentOptionRequest request);
    BatchImportResponse<PaymentOptionResponse> createPaymentOptionBatch(UUID businessId, List<PaymentOptionRequest> requests, String importId);

    PaginationResponse<PaymentOptionResponse> getAllPaymentOptionsWithFilters(
            UUID businessId,
            PaymentOptionFilterRequest filter);


    PaymentOptionResponse getPaymentOptionById(UUID businessId, UUID id);

    PaymentOptionResponse updatePaymentOption(
            UUID businessId,
            UUID id,
            PaymentOptionRequest request);

    void deletePaymentOption(UUID businessId, UUID id);


}

