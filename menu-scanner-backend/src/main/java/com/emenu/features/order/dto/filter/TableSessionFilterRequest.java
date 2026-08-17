package com.emenu.features.order.dto.filter;

import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class TableSessionFilterRequest extends BaseFilterRequest {

    private UUID businessId;

    private String tableId;

    private String status;

    public UUID parseTableId() {
        if (tableId == null || tableId.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(tableId.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(("TABLE-" + tableId.trim().toUpperCase()).getBytes(StandardCharsets.UTF_8));
        }
    }
}
