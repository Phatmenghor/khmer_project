package com.emenu.features.bakong.mapper;

import com.emenu.features.bakong.dto.BakongTransactionLogResponse;
import com.emenu.features.bakong.dto.BakongTransactionResponse;
import com.emenu.features.bakong.model.BakongTransaction;
import com.emenu.features.bakong.model.BakongTransactionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BakongTransactionMapper {

    BakongTransactionResponse toResponse(BakongTransaction transaction);

    BakongTransactionLogResponse toLogResponse(BakongTransactionLog log);

    @Mapping(target = "transactionId", source = "transaction.transactionId")
    @Mapping(target = "transactionRefId", source = "transaction.id")
    @Mapping(target = "projectCode", source = "transaction.projectCode")
    @Mapping(target = "apiKey", source = "transaction.apiKey")
    @Mapping(target = "md5", source = "transaction.md5")
    @Mapping(target = "hash", source = "transaction.hash")
    @Mapping(target = "status", source = "transaction.status")
    @Mapping(target = "amount", source = "transaction.amount")
    @Mapping(target = "currency", source = "transaction.currency")
    @Mapping(target = "fromAccountId", source = "transaction.fromAccountId")
    @Mapping(target = "toAccountId", source = "transaction.toAccountId")
    @Mapping(target = "merchantName", source = "transaction.merchantName")
    @Mapping(target = "rawQrString", source = "transaction.rawQrString")
    @Mapping(target = "action", source = "action")
    @Mapping(target = "responseJson", source = "responseJson")
    @Mapping(target = "errorMessage", source = "errorMessage")
    BakongTransactionLog toLogEntity(BakongTransaction transaction, String action, String responseJson, String errorMessage);
}
