package com.emenu.features.main.dto.response;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class ProductResponseDto extends BaseAuditResponse {
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

    private StockStatus stockStatus;
    private Integer totalStock;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer quantityOnHand;

    private Long viewCount;
    private Long favoriteCount;
    private Boolean isFavorited;

    private UUID businessId;
    private String businessName;

    // Conditional fields based on BusinessSettings
    private UUID categoryId;
    private String categoryName;

    private UUID subcategoryId;
    private String subcategoryName;

    private UUID brandId;
    private String brandName;

    private List<ProductImageDto> images;
    private List<ProductSizeDto> sizes;

    // Helper method to null out fields based on business settings
    public void applyBusinessSettings(
            Boolean useCategories,
            Boolean useSubcategories,
            Boolean useBrands) {

        if (useCategories == null || !useCategories) {
            this.categoryId = null;
            this.categoryName = null;
        }

        if (useSubcategories == null || !useSubcategories) {
            this.subcategoryId = null;
            this.subcategoryName = null;
        }

        if (useBrands == null || !useBrands) {
            this.brandId = null;
            this.brandName = null;
        }
    }
}
