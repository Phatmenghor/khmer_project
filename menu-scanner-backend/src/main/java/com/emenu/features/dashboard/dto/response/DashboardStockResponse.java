package com.emenu.features.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStockResponse {

    private List<DashboardStockItem> data;
    private long lowStockCount;
    private long outOfStockCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStockItem {
        private UUID   id;
        private String name;
        private String sku;
        private int    quantity;
        private int    minStock;   // derived threshold (5)
        private String status;    // IN_STOCK | LOW_STOCK | OUT_OF_STOCK
        private String category;
        private String imageUrl;
    }
}
