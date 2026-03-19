package com.emenu.features.order.dto.response;

import com.emenu.enums.common.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOptionResponse {

    private UUID id;
    private UUID businessId;
    private String name;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }
}
