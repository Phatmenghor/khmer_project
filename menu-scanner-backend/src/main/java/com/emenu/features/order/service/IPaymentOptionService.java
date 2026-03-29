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

public interface IPaymentOptionService {

    /**
     * Create a new payment option
     */
    PaymentOptionResponse createPaymentOption(UUID businessId, PaymentOptionRequest request);

    /**
     * Get all payment options for a business
     */
    List<PaymentOptionResponse> getAllPaymentOptions(UUID businessId);

    /**
     * Get all active payment options for a business
     */
    List<PaymentOptionResponse> getActivePaymentOptions(UUID businessId);

    /**
     * Search payment options with pagination
     */
    Page<PaymentOptionResponse> searchPaymentOptions(
            UUID businessId,
            String search,
            Status status,
            Pageable pageable);

    /**
     * Get payment option by ID
     */
    PaymentOptionResponse getPaymentOptionById(UUID businessId, UUID id);

    /**
     * Update payment option
     */
    PaymentOptionResponse updatePaymentOption(
            UUID businessId,
            UUID id,
            PaymentOptionRequest request);

    /**
     * Delete payment option
     */
    void deletePaymentOption(UUID businessId, UUID id);

    /**
     * Get all payment options with filters and pagination
     */
    PaginationResponse<PaymentOptionResponse> getAllPaymentOptionsWithFilters(
            UUID businessId,
            PaymentOptionFilterRequest filter);

    /**
     * Get all active payment options (public - no pagination)
     */
    List<PaymentOptionResponse> getAllActivePaymentOptions();
}
