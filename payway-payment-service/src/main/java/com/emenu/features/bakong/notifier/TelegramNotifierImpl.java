package com.emenu.features.bakong.notifier;

import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.telegram.service.TelegramService;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TelegramNotifierImpl implements TelegramNotifier {

    private final TelegramService telegramService;

    @Override
    public void notifyQrGenerated(String requestUrl, BakongRequest request, KHQRResponse<KHQRData> response) {
        telegramService.notifyQrGenerated(requestUrl, request, response);
    }

    @Override
    public void notifyTransactionChecked(String requestUrl, String upstreamUrl, CheckTransactionRequest request, BakongResponse response) {
        telegramService.notifyTransactionChecked(requestUrl, upstreamUrl, request, response);
    }

    @Override
    public void notifyIssue(String title, String requestUrl, Object requestPayload, Throwable throwable) {
        telegramService.notifyIssue(title, requestUrl, requestPayload, throwable);
    }
}
