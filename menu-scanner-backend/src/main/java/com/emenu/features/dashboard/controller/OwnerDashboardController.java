package com.emenu.features.dashboard.controller;

import com.emenu.features.dashboard.dto.response.OwnerDashboardDailyTrendsResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardPlanBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardRecentOwnersResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardStatusBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardSummaryResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardTrendsResponse;
import com.emenu.features.dashboard.service.OwnerDashboardService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/owner-dashboard")
@RequiredArgsConstructor
public class OwnerDashboardController {

    private final OwnerDashboardService ownerDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<OwnerDashboardSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Owner dashboard summary",
                ownerDashboardService.getSummary()));
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<OwnerDashboardTrendsResponse>> getTrends() {
        return ResponseEntity.ok(ApiResponse.success("Subscription trends",
                ownerDashboardService.getTrends()));
    }

    @GetMapping("/status-breakdown")
    public ResponseEntity<ApiResponse<OwnerDashboardStatusBreakdownResponse>> getStatusBreakdown() {
        return ResponseEntity.ok(ApiResponse.success("Status breakdown",
                ownerDashboardService.getStatusBreakdown()));
    }

    @GetMapping("/recent-owners")
    public ResponseEntity<ApiResponse<OwnerDashboardRecentOwnersResponse>> getRecentOwners() {
        return ResponseEntity.ok(ApiResponse.success("Recent business owners",
                ownerDashboardService.getRecentOwners()));
    }

    @GetMapping("/plan-breakdown")
    public ResponseEntity<ApiResponse<OwnerDashboardPlanBreakdownResponse>> getPlanBreakdown() {
        return ResponseEntity.ok(ApiResponse.success("Plan breakdown",
                ownerDashboardService.getPlanBreakdown()));
    }

    @GetMapping("/customer-trends")
    public ResponseEntity<ApiResponse<OwnerDashboardDailyTrendsResponse>> getCustomerTrends() {
        return ResponseEntity.ok(ApiResponse.success("Customer registration trends",
                ownerDashboardService.getCustomerTrends()));
    }

    @GetMapping("/user-trends")
    public ResponseEntity<ApiResponse<OwnerDashboardDailyTrendsResponse>> getUserTrends() {
        return ResponseEntity.ok(ApiResponse.success("Business user registration trends",
                ownerDashboardService.getUserTrends()));
    }

    @GetMapping("/payment-trends")
    public ResponseEntity<ApiResponse<OwnerDashboardDailyTrendsResponse>> getPaymentTrends() {
        return ResponseEntity.ok(ApiResponse.success("Payment trends",
                ownerDashboardService.getPaymentTrends()));
    }
}
