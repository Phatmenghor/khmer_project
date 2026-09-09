package com.emenu.features.master.service;

import com.emenu.features.master.dto.filter.PlatformBankFilterRequest;
import com.emenu.features.master.dto.request.PlatformBankRequest;
import com.emenu.features.master.dto.response.PlatformBankResponse;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface PlatformBankService {

    List<PlatformBankResponse> getPublicActivePlatformBanks();

    PaginationResponse<PlatformBankResponse> getAllPlatformBanksWithFilters(PlatformBankFilterRequest filter);

    PlatformBankResponse getPlatformBankById(UUID id);

    PlatformBankResponse createPlatformBank(PlatformBankRequest request);

    PlatformBankResponse updatePlatformBank(UUID id, PlatformBankRequest request);

    void deletePlatformBank(UUID id);
}
