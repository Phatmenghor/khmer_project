package com.emenu.features.order.dto.request;

import com.emenu.enums.order.TableStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTableStatusRequest {

    @NotNull(message = "Status is required")
    private TableStatus status;
}
