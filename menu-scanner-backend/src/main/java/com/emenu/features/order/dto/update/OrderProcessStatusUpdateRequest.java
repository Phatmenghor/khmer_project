package com.emenu.features.order.dto.update;

import com.emenu.enums.common.Status;
import lombok.Data;

@Data
public class OrderProcessStatusUpdateRequest {
    private String name;
    private String description;
    private Status status;
    private Boolean isInitial; // Set as initial status for new orders
}
