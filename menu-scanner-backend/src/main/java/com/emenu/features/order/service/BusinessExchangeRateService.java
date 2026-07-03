package com.emenu.features.order.service;

import com.emenu.features.order.dto.filter.BusinessExchangeRateFilterRequest;
import com.emenu.features.order.dto.request.BusinessExchangeRateCreateRequest;
import com.emenu.features.order.dto.response.BusinessExchangeRateResponse;
import com.emenu.features.order.dto.update.BusinessExchangeRateUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.UUID;

import com.emenu.shared.dto.BatchImportResponse;
import java.util.List;

public interface BusinessExchangeRateService {
    
    BusinessExchangeRateResponse createBusinessExchangeRate(BusinessExchangeRateCreateRequest request);
    BatchImportResponse<BusinessExchangeRateResponse> createBusinessExchangeRateBatch(List<BusinessExchangeRateCreateRequest> requests);
    
    PaginationResponse<BusinessExchangeRateResponse> getAllBusinessExchangeRates(BusinessExchangeRateFilterRequest filter);
    
    BusinessExchangeRateResponse getBusinessExchangeRateById(UUID id);
    
    BusinessExchangeRateResponse updateBusinessExchangeRate(UUID id, BusinessExchangeRateUpdateRequest request);
    
    BusinessExchangeRateResponse deleteBusinessExchangeRate(UUID id);
    
    BusinessExchangeRateResponse getActiveRateByBusinessId(UUID businessId);
}
