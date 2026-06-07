package com.emenu.features.spaces.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpacesUploadRequest {
    /** PRODUCT | CATEGORY | LOGO | BANNER | QR */
    private String entityType;
    /** productId, categoryId, tableId — null for LOGO and BANNER */
    private String entityId;
    /** SM | MD | LG | ORIGINAL — defaults to ORIGINAL when null */
    private String variant;
}
