package com.emenu.features.order.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.BaseAuditResponse;
import com.emenu.shared.dto.ImageUrls;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class DeliveryOptionResponse extends BaseAuditResponse {
    private UUID businessId;
    private String businessName;
    private String name;
    private String description;
    private ImageUrls image;
    private BigDecimal price;
    private Status status;
}