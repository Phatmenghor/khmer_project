package com.emenu.features.subscription.service;

import com.emenu.features.subscription.dto.filter.SubscriptionHistoryFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCancelRequest;
import com.emenu.features.subscription.dto.request.SubscriptionRenewRequest;
import com.emenu.features.subscription.dto.response.SubscriptionHistoryResponse;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {

    PaginationResponse<SubscriptionHistoryResponse> getSubscriptionHistory(SubscriptionHistoryFilterRequest filter);

    List<SubscriptionHistoryResponse> getAllByBusinessId(UUID businessId);

    SubscriptionHistoryResponse getSubscriptionById(UUID subscriptionId);

    SubscriptionHistoryResponse renewSubscription(UUID subscriptionId, SubscriptionRenewRequest request);

    SubscriptionHistoryResponse cancelSubscription(UUID subscriptionId, SubscriptionCancelRequest request);
}
