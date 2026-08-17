package com.emenu.features.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddTableSessionBatchItemsRequest {

    private UUID businessId;

    @NotNull(message = "Table ID is required")
    private String tableId;

    private String tableNumber;

    private Integer orderRound;

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<AddTableSessionItemRequest> items;

    public UUID parseTableId() {
        if (tableId == null || tableId.isBlank()) {
            return UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        try {
            return UUID.fromString(tableId.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(("TABLE-" + tableId.trim().toUpperCase()).getBytes(StandardCharsets.UTF_8));
        }
    }
}
