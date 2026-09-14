package com.emenu.features.bakong.service;

import com.emenu.features.bakong.dto.BakongAccountCreateRequest;
import com.emenu.features.bakong.dto.BakongAccountResponse;
import com.emenu.features.bakong.dto.BakongAccountSearchRequest;
import com.emenu.features.bakong.dto.BakongAccountUpdateRequest;
import com.emenu.features.bakong.dto.BakongIdRequest;
import com.emenu.shared.dto.PageResponse;

import java.util.UUID;

public interface BakongAccountService {

    PageResponse<BakongAccountResponse> getAllAccounts(BakongAccountSearchRequest request);

    BakongAccountResponse getAccountById(UUID id);
    BakongAccountResponse getAccountById(BakongIdRequest request);

    BakongAccountResponse createAccount(BakongAccountCreateRequest request);

    BakongAccountResponse updateAccount(UUID id, BakongAccountUpdateRequest request);
    BakongAccountResponse updateAccount(BakongAccountUpdateRequest request);

    BakongAccountResponse deleteAccount(UUID id);
    BakongAccountResponse deleteAccount(BakongIdRequest request);
}
