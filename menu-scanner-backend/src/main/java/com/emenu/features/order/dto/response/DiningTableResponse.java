package com.emenu.features.order.dto.response;

import com.emenu.features.order.enums.TableStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
