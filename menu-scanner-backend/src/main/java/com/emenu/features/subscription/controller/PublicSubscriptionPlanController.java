package com.emenu.features.subscription.controller;

import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import com.emenu.features.subscription.dto.response.SubscriptionPlanResponse;
import com.emenu.features.subscription.service.SubscriptionPlanService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/public/subscription-plans")
@RequiredArgsConstructor
@Slf4j
public class PublicSubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getAllActivePlans(
            @RequestParam(value = "durationType", required = false) SubscriptionPlanDurationType durationType) {
        log.info("Endpoint: public-get-all-subscription-plans, durationType={}", durationType);

        List<SubscriptionPlanResponse> plans;
        if (durationType != null) {
            plans = subscriptionPlanService.getActivePlanByDurationType(durationType);
        } else {
            plans = subscriptionPlanService.getAllActivePlans();
        }

        return ResponseEntity.ok(ApiResponse.success("Active subscription plans retrieved successfully", plans));
    }
}
