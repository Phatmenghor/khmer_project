package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableSessionResponse {
    private UUID id;
    private UUID tableId;
    private String tableNumber;
    private String zone;
    private String sessionNumber;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime closedAt;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal customizationTotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal grandTotal;
    private List<TableSessionItemResponse> items;
    private List<TableSessionRoundResponse> rounds;
    private List<TableSessionOrderRowResponse> roundRows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableSessionOrderRowResponse {
        private String id;
        private UUID sessionId;
        private String tableNumber;
        private String sessionNumber;
        private Integer round;
        private Integer roundItemsCount;
        private BigDecimal roundTotal;
        private String status;
        private LocalDateTime startedAt;
        private List<TableSessionItemResponse> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableSessionRoundResponse {
        private Integer orderRound;
        private Integer roundItemsCount;
        private BigDecimal roundTotal;
        private LocalDateTime createdAt;
        private List<TableSessionItemResponse> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableSessionItemResponse {
        private UUID id;
        private Integer orderRound;
        private UUID productId;
        private String productName;
        private String imageUrl;
        private UUID sizeId;
        private String sizeName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private BigDecimal customizationTotal;
        private String status;
        private String customerNote;
        private LocalDateTime createdAt;
    }
}
