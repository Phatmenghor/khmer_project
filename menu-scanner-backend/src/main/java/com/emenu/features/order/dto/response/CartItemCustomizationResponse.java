package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemCustomizationResponse {
    private UUID id;
    private UUID productCustomizationId;
    private String name;
    private BigDecimal priceAdjustment;
}
