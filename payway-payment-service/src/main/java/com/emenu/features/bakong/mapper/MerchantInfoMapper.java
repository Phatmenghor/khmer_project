package com.emenu.features.bakong.mapper;

import com.emenu.features.bakong.dto.BakongRequest;
import kh.gov.nbc.bakong_khqr.model.MerchantInfo;
import org.springframework.stereotype.Component;

@Component
public class MerchantInfoMapper {

    public MerchantInfo toMerchantInfo(BakongRequest request, String bakongAccountId) {
        MerchantInfo merchantInfo = new MerchantInfo();
        merchantInfo.setExpirationTimestamp(System.currentTimeMillis() + request.expirationTimestamp() * 60L * 1000);
        merchantInfo.setBakongAccountId(bakongAccountId);
        merchantInfo.setMerchantId(request.merchantId());
        merchantInfo.setAcquiringBank(request.acquiringBank());
        merchantInfo.setCurrency(request.currency());
        merchantInfo.setAmount(request.amount());
        merchantInfo.setMerchantName(request.merchantName());
        merchantInfo.setMerchantCity(request.merchantCity());
        merchantInfo.setBillNumber(request.billNumber());
        merchantInfo.setMobileNumber(request.mobileNumber());
        merchantInfo.setStoreLabel(request.storeLabel());
        merchantInfo.setUpiAccountInformation(request.upiAccountInformation());
        merchantInfo.setMerchantAlternateLanguagePreference(request.merchantAlternateLanguagePreference());
        merchantInfo.setMerchantNameAlternateLanguage(request.merchantNameAlternateLanguage());
        merchantInfo.setMerchantCityAlternateLanguage(request.merchantCityAlternateLanguage());
        merchantInfo.setPurposeOfTransaction(request.purposeOfTransaction());
        merchantInfo.setTerminalLabel(request.terminalLabel());
        return merchantInfo;
    }
}
