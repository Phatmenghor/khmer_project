package com.emenu.features.master.service;

import com.emenu.features.master.dto.request.PlatformProfileRequest;
import com.emenu.features.master.dto.response.PlatformProfileResponse;

public interface PlatformProfileService {

    PlatformProfileResponse getPlatformProfile();

    PlatformProfileResponse updatePlatformProfile(PlatformProfileRequest request);
}
