package com.emenu.features.bakong.common.integration.telegram;

import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;

public interface TelegramNotifier {
    void notifyQrGenerated(String requestUrl, BakongRequest request, KHQRResponse<KHQRData> response);
    void notifyTransactionChecked(String requestUrl, String upstreamUrl, CheckTransactionRequest request, BakongResponse response);
    void notifyIssue(String title, String requestUrl, Object requestPayload, Throwable throwable);
}
