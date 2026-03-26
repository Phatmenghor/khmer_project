package com.emenu.features.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class POSCheckoutAddressRequest {

    @NotBlank(message = "Village is required")
    private String village;

    @NotBlank(message = "Commune is required")
    private String commune;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Province is required")
    private String province;

    private String streetNumber;
    private String houseNumber;
    private String note;

    private BigDecimal latitude;
    private BigDecimal longitude;
}
