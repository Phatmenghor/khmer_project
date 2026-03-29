package com.emenu.features.main.dto.response;

import com.emenu.enums.product.ProductStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Lightweight DTO for admin product listing - NO IMAGES
 * Used by /api/v1/products/admin/my-business/all for fast responses
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ProductAdminListDto extends BaseAuditResponse {
    private String name;
    private String description;
    private ProductStatus status;

    private BigDecimal price;
    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    private BigDecimal displayPrice;
    private BigDecimal displayOriginPrice;
    private String displayPromotionType;
    private BigDecimal displayPromotionValue;
    private LocalDateTime displayPromotionFromDate;
    private LocalDateTime displayPromotionToDate;

    private Boolean hasSizes;
    private Boolean hasPromotion;
    private String mainImageUrl;

    private String barcode;
    private String sku;
    private Integer totalStock;

    private Long viewCount;
    private Long favoriteCount;

    private UUID businessId;
    private String businessName;

    private UUID categoryId;
    private String categoryName;

    private UUID brandId;
    private String brandName;

    private List<ProductSizeDto> sizes;
}
