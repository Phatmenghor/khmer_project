package com.emenu.features.order.dto.response;

import com.emenu.enums.order.TableStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class DiningTableResponse {
    private UUID id;
    private UUID businessId;
    private String number;
    private String zone;
    private Integer capacity;
    private TableStatus status;
    private UUID activeOrderId;
    private Long seatedMinutes;
    private ActiveOrderInfo activeOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Setter
    @Builder
    public static class ActiveOrderInfo {
        private UUID orderId;
        private String orderNumber;
        private BigDecimal totalAmount;
        private String paymentStatus;
        private String itemsSummary;
        private LocalDateTime createdAt;
    }
}
