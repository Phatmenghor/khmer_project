package com.emenu.features.bakong.service;

import com.emenu.features.bakong.dto.BakongMonitoringStatusResponse.TokenStatusInfo;

public interface BakongTokenService {

    String getToken();

    String getTokenForEmail(String email);

    String renewToken();

    String renewTokenForEmail(String email);

    TokenStatusInfo getTokenStatusInfo();
}

