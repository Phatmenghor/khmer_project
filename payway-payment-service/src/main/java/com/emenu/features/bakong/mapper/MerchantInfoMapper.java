package com.emenu.features.bakong.mapper;

import com.emenu.features.bakong.dto.BakongRequest;
import kh.gov.nbc.bakong_khqr.model.MerchantInfo;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MerchantInfoMapper {

    @Mapping(target = "bakongAccountId", source = "bakongAccountId")
    @Mapping(target = "merchantId", source = "request.merchantId")
    @Mapping(target = "acquiringBank", source = "request.acquiringBank")
    @Mapping(target = "currency", source = "request.currency")
    @Mapping(target = "amount", source = "request.amount")
    @Mapping(target = "merchantName", source = "request.merchantName")
    @Mapping(target = "merchantCity", source = "request.merchantCity")
    @Mapping(target = "billNumber", source = "request.billNumber")
    @Mapping(target = "mobileNumber", source = "request.mobileNumber")
    @Mapping(target = "storeLabel", source = "request.storeLabel")
    @Mapping(target = "upiAccountInformation", source = "request.upiAccountInformation")
    @Mapping(target = "merchantAlternateLanguagePreference", source = "request.merchantAlternateLanguagePreference")
    @Mapping(target = "merchantNameAlternateLanguage", source = "request.merchantNameAlternateLanguage")
    @Mapping(target = "merchantCityAlternateLanguage", source = "request.merchantCityAlternateLanguage")
    @Mapping(target = "purposeOfTransaction", source = "request.purposeOfTransaction")
    @Mapping(target = "terminalLabel", source = "request.terminalLabel")
    MerchantInfo toMerchantInfo(BakongRequest request, String bakongAccountId);

    @AfterMapping
    default void calculateExpirationTimestamp(@MappingTarget MerchantInfo merchantInfo, BakongRequest request) {
        if (request != null && request.expirationTimestamp() != null) {
            merchantInfo.setExpirationTimestamp(System.currentTimeMillis() + request.expirationTimestamp() * 60L * 1000);
        }
    }
}
