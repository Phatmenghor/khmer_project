package com.emenu.features.dashboard.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.dashboard.dto.response.*;
import com.emenu.features.dashboard.service.DashboardService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtils    securityUtils;

    // ── Summary / KPIs ─────────────────────────────────────────────────────────

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/summary - business={} period={}", businessId, period);
        DashboardSummaryResponse data = dashboardService.getSummary(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved", data));
    }

    // ── Sales Analytics ────────────────────────────────────────────────────────

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<DashboardSalesResponse>> getSales(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/sales - business={} period={}", businessId, period);
        DashboardSalesResponse data = dashboardService.getSales(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Sales data retrieved", data));
    }

    // ── Payment Methods ────────────────────────────────────────────────────────

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<DashboardPaymentsResponse>> getPayments(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/payments - business={} period={}", businessId, period);
        DashboardPaymentsResponse data = dashboardService.getPayments(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Payment methods retrieved", data));
    }

    // ── Inventory / Stock ──────────────────────────────────────────────────────

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<DashboardStockResponse>> getStock() {
        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/stock - business={}", businessId);
        DashboardStockResponse data = dashboardService.getStock(businessId);
        return ResponseEntity.ok(ApiResponse.success("Stock data retrieved", data));
    }

    // ── Recent Orders ──────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<DashboardOrdersResponse>> getRecentOrders(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/orders - business={} period={}", businessId, period);
        DashboardOrdersResponse data = dashboardService.getRecentOrders(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Recent orders retrieved", data));
    }

    // ── Top Products ───────────────────────────────────────────────────────────

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<DashboardTopProductsResponse>> getTopProducts(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/top-products - business={} period={}", businessId, period);
        DashboardTopProductsResponse data = dashboardService.getTopProducts(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Top products retrieved", data));
    }

    // ── Hourly Sales Heatmap ───────────────────────────────────────────────────

    @GetMapping("/hourly-sales")
    public ResponseEntity<ApiResponse<DashboardHourlySalesResponse>> getHourlySales(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/hourly-sales - business={} period={}", businessId, period);
        DashboardHourlySalesResponse data = dashboardService.getHourlySales(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Hourly sales retrieved", data));
    }

    // ── Customer Stats ─────────────────────────────────────────────────────────

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<DashboardCustomerStatsResponse>> getCustomerStats(
            @RequestParam(defaultValue = "TODAY") String period) {

        UUID businessId = getBusinessId();
        log.info("Endpoint: dashboard/customers - business={} period={}", businessId, period);
        DashboardCustomerStatsResponse data = dashboardService.getCustomerStats(businessId, period);
        return ResponseEntity.ok(ApiResponse.success("Customer stats retrieved", data));
    }

    // ─── helper ───────────────────────────────────────────────────────────────

    private UUID getBusinessId() {
        User user = securityUtils.getCurrentUser();
        return user.getBusinessId();
    }
}
