package com.emenu.features.master.controller;

import com.emenu.features.master.dto.response.SubscriptionPlanResponse;
import com.emenu.features.master.service.SubscriptionPlanService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/subscription-plans")
@RequiredArgsConstructor
public class PublicSubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getAllActivePlans() {
        List<SubscriptionPlanResponse> plans = subscriptionPlanService.getAllActivePlans();
        return ResponseEntity.ok(ApiResponse.success("Active subscription plans retrieved successfully", plans));
    }
}
