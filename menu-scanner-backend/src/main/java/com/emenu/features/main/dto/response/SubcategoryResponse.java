package com.emenu.features.main.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class SubcategoryResponse extends BaseAuditResponse {
    private UUID categoryId;
    private String categoryName;
    private UUID businessId;
    private String businessName;
    private String name;
    private String imageUrl;
    private Status status;
}
