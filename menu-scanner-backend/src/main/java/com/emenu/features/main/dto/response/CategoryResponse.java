package com.emenu.features.main.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.BaseAuditResponse;
import com.emenu.shared.dto.ImageUrls;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class CategoryResponse extends BaseAuditResponse {
    private UUID businessId;
    private String businessName;
    private String name;
    private ImageUrls image;
    private String description;
    private Status status;
}
