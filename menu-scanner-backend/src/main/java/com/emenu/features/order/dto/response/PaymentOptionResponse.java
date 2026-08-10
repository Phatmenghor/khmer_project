package com.emenu.features.order.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.enums.payment.PaymentOptionType;
import com.emenu.shared.dto.ImageUrls;
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
    private String description;
    private PaymentOptionType paymentOptionType;
    private Status status;
    private ImageUrls image;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
