package com.emenu.features.subscription.service;

import com.emenu.features.subscription.dto.filter.SubscriptionPaymentFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionPaymentCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionPaymentResponse;
import com.emenu.features.subscription.dto.update.SubscriptionPaymentUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.UUID;

public interface SubscriptionPaymentService {

    SubscriptionPaymentResponse createSubscriptionPayment(SubscriptionPaymentCreateRequest request);

    PaginationResponse<SubscriptionPaymentResponse> getAllSubscriptionPayments(SubscriptionPaymentFilterRequest filter);

    SubscriptionPaymentResponse getSubscriptionPaymentById(UUID id);

    SubscriptionPaymentResponse updateSubscriptionPayment(UUID id, SubscriptionPaymentUpdateRequest request);

    SubscriptionPaymentResponse deleteSubscriptionPayment(UUID id);
}
