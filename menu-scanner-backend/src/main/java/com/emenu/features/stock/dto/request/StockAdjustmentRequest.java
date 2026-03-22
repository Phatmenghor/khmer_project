package com.emenu.features.stock.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustmentRequest {

    @NotNull(message = "Product stock ID is required")
    private UUID productStockId;

    @NotBlank(message = "Adjustment type is required")
    @Pattern(regexp = "RECOUNT|RECEIVED|DAMAGED|LOST|CORRECTION",
             message = "Invalid adjustment type")
    private String adjustmentType;

    @NotNull(message = "Adjustment quantity is required")
    private Integer adjustmentQuantity; // Can be positive or negative

    @NotBlank(message = "Reason is required")
    @Size(min = 3, max = 255, message = "Reason must be between 3 and 255 characters")
    private String reason;

    @Size(max = 1000, message = "Detail notes cannot exceed 1000 characters")
    private String detailNotes;

    @Builder.Default
    private Boolean requiresApproval = false;
}
