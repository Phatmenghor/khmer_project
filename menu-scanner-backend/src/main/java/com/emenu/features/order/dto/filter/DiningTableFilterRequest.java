package com.emenu.features.order.dto.filter;

import com.emenu.enums.order.TableStatus;
import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class DiningTableFilterRequest extends BaseFilterRequest {

    private UUID businessId;

    private TableStatus status;

    private String zone;
}
