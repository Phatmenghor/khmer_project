package com.emenu.features.main.dto.request;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.PromotionType;
import com.emenu.shared.dto.ImageUrls;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ProductCreateDto {
    
    @NotBlank(message = "Product name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Category is required")
    private UUID categoryId;

    private UUID brandId;
    
    @DecimalMin(value = "0.0", message = "Price must be non-negative")
    private BigDecimal price;
    
    private ImageUrls mainImage;

    private String barcode;
    private String sku;

    private PromotionType promotionType;
    private BigDecimal promotionValue;

    @JsonFormat(pattern = "yyyy-MM-dd['T'HH:mm[:ss]]")
    private LocalDateTime promotionFromDate;

    @JsonFormat(pattern = "yyyy-MM-dd['T'HH:mm[:ss]]")
    private LocalDateTime promotionToDate;
    
    @Valid
    private List<ProductImageCreateDto> images;
    
    @Valid
    private List<ProductSizeCreateDto> sizes;

    @Valid
    private List<ProductCustomizationCreateDto> customizations;

    private ProductStatus status = ProductStatus.ACTIVE;
}