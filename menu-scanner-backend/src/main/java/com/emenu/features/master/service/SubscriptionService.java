package com.emenu.features.master.service;

import com.emenu.features.master.dto.filter.SubscriptionHistoryFilterRequest;
import com.emenu.features.master.dto.request.SubscriptionCancelRequest;
import com.emenu.features.master.dto.request.SubscriptionRenewRequest;
import com.emenu.features.master.dto.response.MySubscriptionSummaryResponse;
import com.emenu.features.master.dto.response.SubscriptionHistoryResponse;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {

    MySubscriptionSummaryResponse getMySubscriptionSummary();

    PaginationResponse<SubscriptionHistoryResponse> getSubscriptionHistory(SubscriptionHistoryFilterRequest filter);

    List<SubscriptionHistoryResponse> getAllByBusinessId(UUID businessId);

    SubscriptionHistoryResponse getSubscriptionById(UUID subscriptionId);

    SubscriptionHistoryResponse getCurrentSubscriptionByBusinessId(UUID businessId);

    SubscriptionHistoryResponse renewSubscription(UUID subscriptionId, SubscriptionRenewRequest request);

    SubscriptionHistoryResponse cancelSubscription(UUID subscriptionId, SubscriptionCancelRequest request);

    byte[] getSubscriptionReceiptPdf(UUID subscriptionId);
}
