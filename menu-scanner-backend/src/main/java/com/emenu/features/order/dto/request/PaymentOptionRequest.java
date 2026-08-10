package com.emenu.features.order.dto.request;

import com.emenu.enums.common.Status;
import com.emenu.enums.payment.PaymentOptionType;
import com.emenu.shared.dto.ImageUrls;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOptionRequest {

    @NotBlank(message = "Payment option name is required")
    private String name;

    @NotNull(message = "Type is required")
    private PaymentOptionType paymentOptionType;

    @NotNull(message = "Status is required")
    private Status status;

    private String description;

    private ImageUrls image;
}
