package com.emenu.features.bakong.service;

import com.emenu.features.bakong.dto.BakongConfigCreateRequest;
import com.emenu.features.bakong.dto.BakongConfigResponse;
import com.emenu.features.bakong.dto.BakongConfigSearchRequest;
import com.emenu.features.bakong.dto.BakongConfigUpdateRequest;
import com.emenu.features.bakong.dto.BakongIdRequest;
import com.emenu.shared.dto.PageResponse;

import java.util.UUID;

public interface BakongConfigService {

    PageResponse<BakongConfigResponse> getAllConfigs(BakongConfigSearchRequest request);

    BakongConfigResponse getConfigById(UUID id);
    BakongConfigResponse getConfigById(BakongIdRequest request);

    BakongConfigResponse createConfig(BakongConfigCreateRequest request);

    BakongConfigResponse updateConfig(UUID id, BakongConfigUpdateRequest request);
    BakongConfigResponse updateConfig(BakongConfigUpdateRequest request);

    BakongConfigResponse deleteConfig(UUID id);
    BakongConfigResponse deleteConfig(BakongIdRequest request);
}
