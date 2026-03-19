package com.emenu.features.order.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CartPaginationRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    @Min(value = 1, message = "Page number must be at least 1")
    private Integer pageNo = 1;

    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 101, message = "Page size cannot exceed 101")
    private Integer pageSize = 20;
}
