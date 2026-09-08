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
    @Mapping(target = "merchantId", source = "bakongAccountId")
    @Mapping(target = "acquiringBank", source = "bakongAccountId")
    @Mapping(target = "currency", source = "request.currency")
    @Mapping(target = "amount", source = "request.amount")
    @Mapping(target = "merchantName", source = "request.merchantName")
    @Mapping(target = "merchantCity", source = "request.merchantCity")
    @Mapping(target = "billNumber", source = "request.billNumber")
    @Mapping(target = "mobileNumber", source = "request.mobileNumber")
    @Mapping(target = "storeLabel", source = "request.storeLabel")
    @Mapping(target = "terminalLabel", source = "request.terminalLabel")
    MerchantInfo toMerchantInfo(BakongRequest request, String bakongAccountId);

    @AfterMapping
    default void applyDefaults(@MappingTarget MerchantInfo info, String bakongAccountId) {
        if (info.getMerchantId() == null || info.getMerchantId().isBlank()) {
            info.setMerchantId(bakongAccountId != null ? bakongAccountId : "Bakong");
        }
        if (info.getAcquiringBank() == null || info.getAcquiringBank().isBlank()) {
            info.setAcquiringBank(bakongAccountId != null ? bakongAccountId : "Bakong Bank");
        }
        if (info.getMerchantName() == null || info.getMerchantName().isBlank()) {
            info.setMerchantName("eMenu Merchant");
        }
        if (info.getMerchantCity() == null || info.getMerchantCity().isBlank()) {
            info.setMerchantCity("Phnom Penh");
        }
    }
}
