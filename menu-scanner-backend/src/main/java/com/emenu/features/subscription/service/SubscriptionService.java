package com.emenu.features.subscription.service;

import com.emenu.features.subscription.dto.filter.SubscriptionFilterRequest;
import com.emenu.features.subscription.dto.filter.SubscriptionHistoryFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCancelRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionHistoryResponse;
import com.emenu.features.subscription.dto.response.SubscriptionResponse;
import com.emenu.features.subscription.dto.request.SubscriptionRenewRequest;
import com.emenu.features.subscription.dto.update.SubscriptionUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.UUID;

public interface SubscriptionService {

    SubscriptionResponse createSubscription(SubscriptionCreateRequest request);
    PaginationResponse<SubscriptionResponse> getSubscriptions(SubscriptionFilterRequest filter);
    PaginationResponse<SubscriptionResponse> getCurrentUserBusinessSubscriptions(SubscriptionFilterRequest filter);
    SubscriptionResponse getSubscriptionById(UUID id);
    SubscriptionResponse updateSubscription(UUID id, SubscriptionUpdateRequest request);
    SubscriptionResponse deleteSubscription(UUID id);
    SubscriptionResponse renewSubscription(UUID subscriptionId, SubscriptionRenewRequest request);
    SubscriptionResponse cancelSubscription(UUID subscriptionId, SubscriptionCancelRequest request);

    PaginationResponse<SubscriptionHistoryResponse> getSubscriptionHistory(SubscriptionHistoryFilterRequest filter);
}