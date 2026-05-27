package com.emenu.features.subscription.dto.request;

import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SubscriptionPlanCreateRequest {
    @NotBlank(message = "Plan name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be non-negative")
    private BigDecimal price;

    @NotNull(message = "Duration type is required")
    private SubscriptionPlanDurationType durationType = SubscriptionPlanDurationType.MONTHLY;

    private SubscriptionPlanStatus status = SubscriptionPlanStatus.PUBLIC;
}