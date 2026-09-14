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
    MerchantInfo toMerchantInfo(BakongRequest request, String bakongAccountId);

    @AfterMapping
    default void applyDefaults(@MappingTarget MerchantInfo info, BakongRequest request, String bakongAccountId) {
        if (request != null && request.getExpirationMinutes() != null && request.getExpirationMinutes() > 0) {
            long now = System.currentTimeMillis();
            info.setExpirationTimestamp(now + (request.getExpirationMinutes() * 60 * 1000L));
        }
    }
}
