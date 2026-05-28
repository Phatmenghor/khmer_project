package com.emenu.features.dashboard.controller;

import com.emenu.features.dashboard.dto.response.OwnerDashboardPlanBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardRecentOwnersResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardStatusBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardSummaryResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardTrendsResponse;
import com.emenu.features.dashboard.service.OwnerDashboardService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/owner-dashboard")
@RequiredArgsConstructor
@Slf4j
public class OwnerDashboardController {

    private final OwnerDashboardService ownerDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<OwnerDashboardSummaryResponse>> getSummary(
            @RequestParam(defaultValue = "30D") String period) {
        log.info("Endpoint: owner-dashboard/summary - period={}", period);
        return ResponseEntity.ok(ApiResponse.success("Owner dashboard summary",
                ownerDashboardService.getSummary(period)));
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<OwnerDashboardTrendsResponse>> getTrends(
            @RequestParam(defaultValue = "30D") String period) {
        log.info("Endpoint: owner-dashboard/trends - period={}", period);
        return ResponseEntity.ok(ApiResponse.success("Subscription trends",
                ownerDashboardService.getTrends(period)));
    }

    @GetMapping("/status-breakdown")
    public ResponseEntity<ApiResponse<OwnerDashboardStatusBreakdownResponse>> getStatusBreakdown() {
        log.info("Endpoint: owner-dashboard/status-breakdown");
        return ResponseEntity.ok(ApiResponse.success("Status breakdown",
                ownerDashboardService.getStatusBreakdown()));
    }

    @GetMapping("/recent-owners")
    public ResponseEntity<ApiResponse<OwnerDashboardRecentOwnersResponse>> getRecentOwners() {
        log.info("Endpoint: owner-dashboard/recent-owners");
        return ResponseEntity.ok(ApiResponse.success("Recent business owners",
                ownerDashboardService.getRecentOwners()));
    }

    @GetMapping("/plan-breakdown")
    public ResponseEntity<ApiResponse<OwnerDashboardPlanBreakdownResponse>> getPlanBreakdown() {
        log.info("Endpoint: owner-dashboard/plan-breakdown");
        return ResponseEntity.ok(ApiResponse.success("Plan breakdown",
                ownerDashboardService.getPlanBreakdown()));
    }
}
