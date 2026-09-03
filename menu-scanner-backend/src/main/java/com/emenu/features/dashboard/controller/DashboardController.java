package com.emenu.features.dashboard.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.dashboard.dto.response.*;
import com.emenu.features.dashboard.service.DashboardService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtils    securityUtils;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        DashboardSummaryResponse data = dashboardService.getSummary(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved", data));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<DashboardSalesResponse>> getSales(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        DashboardSalesResponse data = dashboardService.getSales(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Sales data retrieved", data));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<DashboardPaymentsResponse>> getPayments(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        DashboardPaymentsResponse data = dashboardService.getPayments(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Payment methods retrieved", data));
    }

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<DashboardStockResponse>> getStock() {
        UUID businessId = getBusinessId();
        DashboardStockResponse data = dashboardService.getStock(businessId);
        return ResponseEntity.ok(ApiResponse.success("Stock data retrieved", data));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<DashboardOrdersResponse>> getRecentOrders(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        DashboardOrdersResponse data = dashboardService.getRecentOrders(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Recent orders retrieved", data));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<DashboardTopProductsResponse>> getTopProducts(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        DashboardTopProductsResponse data = dashboardService.getTopProducts(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Top products retrieved", data));
    }

    @GetMapping("/hourly-sales")
    public ResponseEntity<ApiResponse<DashboardHourlySalesResponse>> getHourlySales(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        DashboardHourlySalesResponse data = dashboardService.getHourlySales(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Hourly sales retrieved", data));
    }

    @GetMapping("/customer-growth")
    public ResponseEntity<ApiResponse<DashboardCustomerGrowthResponse>> getCustomerGrowth() {
        UUID businessId = getBusinessId();
        DashboardCustomerGrowthResponse data = dashboardService.getCustomerGrowth(businessId);
        return ResponseEntity.ok(ApiResponse.success("Customer growth retrieved", data));
    }

    private UUID getBusinessId() {
        User user = securityUtils.getCurrentUser();
        return user.getBusinessId();
    }
}
