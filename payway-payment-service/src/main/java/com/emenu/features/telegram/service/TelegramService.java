package com.emenu.features.telegram.service;

import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.telegram.dto.TelegramCustomMessageRequest;
import com.emenu.features.telegram.dto.TelegramNotificationResponse;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;

public interface TelegramService {

    TelegramNotificationResponse sendCustomNotification(TelegramCustomMessageRequest request);

    void sendMessage(String message);

    void sendMessageToChat(String chatId, String message, String parseMode);

    void notifyQrGenerated(String requestUrl, BakongRequest request, KHQRResponse<KHQRData> response);

    void notifyTransactionChecked(String requestUrl, String upstreamUrl, CheckTransactionRequest request, BakongResponse response);

    void notifyIssue(String title, String requestUrl, Object requestPayload, Throwable throwable);
}
