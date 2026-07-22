package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.BusinessFilterRequest;
import com.emenu.features.auth.dto.response.BusinessResponse;
import com.emenu.features.auth.service.BusinessService;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.exception.custom.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/businesses")
@RequiredArgsConstructor
@Slf4j
public class BusinessController {

    private final BusinessService businessService;
    private final SecurityUtils securityUtils;
    private final BusinessRepository businessRepository;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessResponse>>> getAllBusinesses(
            @RequestBody BusinessFilterRequest filterRequest) {
        log.info("Endpoint: businesses/all - search: {}", filterRequest.getSearch());
        PaginationResponse<BusinessResponse> response = businessService.getAllBusinesses(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Businesses retrieved successfully", response));
    }

    @GetMapping("/subscription/remaining-days")
    public ResponseEntity<ApiResponse<Long>> getSubscriptionRemainingDays() {
        log.info("Endpoint: businesses/subscription/remaining-days - fetching remaining days");
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }
        Business business = businessRepository.findById(currentUser.getBusinessId())
                .orElseThrow(() -> new ValidationException("Business not found"));
        
        Long days = 0L;
        if (business.getSubscriptions() != null) {
            days = business.getSubscriptions().stream()
                    .filter(Subscription::isActive)
                    .findFirst()
                    .map(Subscription::getDaysRemaining)
                    .orElse(0L);
        }
        return ResponseEntity.ok(ApiResponse.success("Remaining days retrieved successfully", days));
    }
}
