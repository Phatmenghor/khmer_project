package com.emenu.features.subscription.controller;

import com.emenu.features.subscription.dto.response.SubscriptionPlanResponse;
import com.emenu.features.subscription.service.SubscriptionPlanService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/subscription-plans")
@RequiredArgsConstructor
@Slf4j
public class PublicSubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getAllActivePlans() {
        log.info("Endpoint: public-get-all-subscription-plans");
        List<SubscriptionPlanResponse> plans = subscriptionPlanService.getAllActivePlans();
        return ResponseEntity.ok(ApiResponse.success("Active subscription plans retrieved successfully", plans));
    }
}
